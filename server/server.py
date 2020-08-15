#!/usr/bin/env python
# -*- coding: utf-8

import sys
from eventlet import wsgi
import os, time, re
import cv2
import numpy as np
import pickle
import PIL.Image
from threading import Thread
import queue
import time
import random
import asyncio
import base64

from flask import Flask, jsonify, request, render_template, send_file, send_from_directory
from flask_compress import Compress
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO,send,emit,join_room

import argparse
import json
import traceback

import urllib.request
import urllib.error
from urllib.parse import urlparse,quote

from os.path import splitext

from user_agent import generate_user_agent

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.wait import WebDriverWait

import eventlet
eventlet.monkey_patch()

from requests import get

parser = argparse.ArgumentParser(description='Marrow Dataset tool server')

#parser.add_argument('--dummy', action='store_true' , help='Use a Dummy GAN')
    
args = parser.parse_args()

class Scraper(Thread):
    def __init__(self,keyword,download_dir,app,socket_id,session_id,num_requested = 100):
        print("Init scraper")
        self.keyword = keyword
        self.download_dir = download_dir
        self.app = app
        self.socket_id = socket_id
        self.session_id = session_id
        self.num_requested = num_requested
        Thread.__init__(self)


    def run(self):
        print("Running scraper")
        with self.app.app_context():
            self.get_image_links(
                self.keyword,
                self.download_dir,
                self.socket_id,
                self.session_id,
                self.num_requested
            )


    def get_image_links(self, main_keyword, download_dir,socket_id,session_id, num_requested = 100):
        """get image links with selenium
        
        Args:
            main_keyword (str): main keyword
            link_file_path (str): path of the file to store the links
            num_requested (int, optional): maximum number of images to download
        
        Returns:
            None
        """
        number_of_scrolls = int(num_requested / 400) + 1 
        # number_of_scrolls * 400 images will be opened in the browser

        options = Options()
        options.add_argument('-headless')
        img_urls = set()
        img_dir = download_dir + '/raw'
        print("Image dir: {}".format(img_dir))
        if not os.path.exists(img_dir):
            os.makedirs(img_dir)
        driver = webdriver.Firefox(executable_path='geckodriver', options=options)
        search_query = quote(main_keyword)
        url = "https://www.google.com/search?q="+search_query+"&source=lnms&tbm=isch"
        driver.get(url)
        """
        for _ in range(number_of_scrolls):
            for __ in range(10):
                # multiple scrolls needed to show all 400 images
                driver.execute_script("window.scrollBy(0, 1000000)")
                time.sleep(2)
            # to load next 400 images
            time.sleep(1)
            try:
                driver.find_element_by_xpath("//input[@value='Show more results']").click()
            except Exception as e:
                print("Process-{0} reach the end of page or get the maximum number of requested images".format(main_keyword))
                break

        """
        thumbs = driver.find_elements_by_xpath('//a[@class="wXeWr islib nfEiy mM5pbd"]')

        print(len(thumbs))
        for thumb in thumbs:
            try:
                thumb.click()
                time.sleep(0.2)
            except e:
                print("Error clicking one thumbnail")

            url_elements = driver.find_elements_by_xpath('//img[@class="n3VNCb"]')
            for url_element in url_elements:
                try:
                    url = url_element.get_attribute('src')
                except e:
                    print("Error getting one url")

                if url.startswith('http') and not url.startswith('https://encrypted-tbn0.gstatic.com'):
                    img_urls.add(url)
                    print("Found image url {}".format(url))
                    emit('image',{'url':url},room=socket_id, namespace='/')

                    # In case we want to download them
                    #path = urlparse(url).path
                    #ext = splitext(path)[1]
                    #req = urllib.request.Request(url, headers = {"User-Agent": generate_user_agent()})
                    #response = urllib.request.urlopen(req)
                    #data = response.read()
                    #file_path = '{0}/{1}{2}'.format(img_dir,len(img_urls),ext)
                    #with open(file_path,'wb') as wf:
                    #    wf.write(data)
                    #emit('image',{'url':'sessions/{}/raw/{}{}'.format(session_id,len(img_urls),ext)},room=socket_id, namespace='/')

        print('Process-{0} totally get {1} images'.format(main_keyword, len(img_urls)))
        driver.quit()



app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins="*")
Compress(app)

WEBPACK_DEV_SERVER_HOST = "http://localhost:8080"

def proxy(host, path):
    response = get(f"{host}{path}")
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ]
    headers = {
        name: value
        for name, value in response.raw.headers.items()
        if name.lower() not in excluded_headers
    }
    return (response.content, response.status_code, headers)

@app.route('/sessions/<path:filepath>')
def data(filepath):
    return send_from_directory('sessions', filepath)

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def main(path):
    return proxy(WEBPACK_DEV_SERVER_HOST, request.path)
    #return app.send_static_file(path)

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/session',  methods = ['POST'])
def create_session():
    try:
        params = request.get_json()
        if ('keyword' not in params or len(params['keyword']) == 0):
            raise Exception('Keyword cannot be empty')
        if ('socket' not in params or len(params['socket']) == 0):
            raise Exception('Socket cannot be empty')

        timestamp = int(time.time())
        session_id = '{}-{}'.format(params['keyword'],timestamp)

        out = jsonify(result="OK",dataset_session=session_id)

        return out

    except Exception as e:
        traceback.print_stack()
    return jsonify(result=str(e))

@app.route('/search',  methods = ['POST'])
def search():
    try:
        params = request.get_json()
        print(params)
        session_id = params['session']
        socket_id =  params['socket']

        download_dir = 'server/sessions/{}'.format(session_id)
        print("Get image links to socket {}".format(socket_id))

        scraper = Scraper(
            params['keyword'],
            download_dir,
            app,
            socket_id,
            session_id
        )
        scraper.start()

        return jsonify(result="OK")

    except Exception as e:
        print("Error in route /search {}".format(str(e)))
        return jsonify(result=str(e))

@socketio.on('connect')
def on_connect():
    print("Client connected {}".format(request.sid))
    join_room(request.sid)
    # if(request.method=='POST'):
    #  some_json=request.get_json()
    #  return jsonify({"key":some_json})
    # else:
    #     return jsonify({"GET":"GET"})

if __name__ == '__main__':

	#print("Generating samples")
	#for t in np.arange(0, 300, 0.000001):
	#	s.gen(t)
  app.debug = True
  wsgi.server(eventlet.listen(('', 8540)), app, debug=True)

  # app.run(host = "0.0.0.0", port = 8080,debug=True)
       
    

