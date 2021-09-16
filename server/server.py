#!/usr/bin/env python
# -*- coding: utf-8

import eventlet
eventlet.monkey_patch()

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

from flask import Flask, jsonify, request, render_template, send_file, send_from_directory, Response, stream_with_context
from flask_compress import Compress
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO,send,emit,join_room

import argparse
import json
import traceback

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

from urllib.parse import urlparse,quote
import urllib3
urllib3.disable_warnings()

import requests
import shutil 

parser = argparse.ArgumentParser(description='Marrow Dataset tool server')

#parser.add_argument('--dummy', action='store_true' , help='Use a Dummy GAN')
    
args = parser.parse_args()

class Scraper(Thread):
    def __init__(self, queue, stop_flag, app, sessions):
        print("Init scraper")
        self.queue = queue
        self.stop_flag = stop_flag
        self.app = app
        self.sessions = sessions

        Thread.__init__(self)


    def run(self):
        print("Running scraper")
        print("Starting Firefox Headless WebDriver")
        options = Options()
        options.add_argument('-headless')
        self.driver = webdriver.Firefox(executable_path='geckodriver', options=options)
        while True:
          search_params = self.queue.get()
          print("New search request {}".format(search_params))
          self.get_image_links(
            search_params["keyword"],
            search_params["download_dir"],
            search_params["session_id"]
          )
          self.stop_flag.reset()



    def get_image_links(self, main_keyword, download_dir, session_id, num_requested = 100):

        with self.app.app_context():
        
            number_of_scrolls = int(num_requested / 400) + 1 
            # number_of_scrolls * 400 images will be opened in the browser

            img_urls = set()
            #img_dir = download_dir + '/raw'
            #print("Image dir: {}".format(img_dir))
            #if not os.path.exists(img_dir):
            #    os.makedirs(img_dir)
            search_query = quote(main_keyword)
            url = "https://www.google.com/search?q="+search_query+"&source=lnms&tbm=isch"
            self.driver.get(url)
            print("Scrolling")
            for i in range(2):
                self.driver.execute_script("window.scrollBy(0, 1000000)")
                time.sleep(0.5)
            all_thumbs = self.driver.find_elements_by_xpath('//a[@class="wXeWr islib nfEiy"]')
            print('Gathered {} thumbs'.format(len(all_thumbs)))
            print("Collecting full size pics")

            thumb_gen = (thumb for thumb in all_thumbs if self.queue.empty() and not self.stop_flag.stop)

            for thumb in thumb_gen:
                try:
                    thumb.click()
                    time.sleep(0.5)
                except Exception as e:
                    print("Error clicking one thumbnail")

                url_elements = self.driver.find_elements_by_xpath('//img[@class="n3VNCb"]')

                url_gen = (url_element for url_element in url_elements if self.queue.empty())

                for url_element in url_gen:
                    try:
                        url = url_element.get_attribute('src')
                    except Exception as e:
                        print("Error getting one url")

                    if url.startswith('http') and not url.startswith('https://encrypted-tbn0.gstatic.com'):
                        img_urls.add(url)
                        print("Found image url {}".format(url))
                        socket_id = sessions[session_id]
                        print("Socket ID: {}".format(socket_id))
                        emit('image',{'url':url, 'keyword': main_keyword},broadcast=True, namespace='/')

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


method_requests_mapping = {
    'GET': requests.get,
    'HEAD': requests.head,
    'POST': requests.post,
    'PUT': requests.put,
    'DELETE': requests.delete,
    'PATCH': requests.patch,
    'OPTIONS': requests.options,
}

class StopFlag:
   def __init__(self):
       self.stop = False

   def flag(self):
       self.stop = True

   def reset(self):
       self.stop = False

class Poser(Thread):
    def __init__(self, queue, app):
        print("Init poser")
        self.queue = queue
        self.app = app

        Thread.__init__(self)

    def run(self):
        print("Running poser")
        print("Starting Firefox Headless WebDriver")

        ENDPOINT = 'https://densepose.dataset.tools/pose'

        while True:
          params = self.queue.get()
          print("New image request")
          with self.app.app_context():
            try:
                response = requests.get(params['url'])
                print("Decoding {}".format(params['url']))

                if response.status_code == 200:
                    response.raw.decode_content = True
                    uri = (
                        "data:" +
                       response.headers['Content-Type'] + ";" +
                       "base64," + base64.b64encode(response.content).decode("utf-8")
                    )
                    
                    pose = requests.post(ENDPOINT, json={
                        "data": uri,
                        "numOfPeople" : params['numOfPeople'],
                        "numOfPermutations" : params['numOfPermutations']
                    })

                    result = pose.json()
                    result['keyword'] = params['keyword']
                    result['socketSessionId'] = params['socketSessionId']

                    emit('pose', result ,broadcast=True, namespace='/')
            except Exception as e:
                print("Failed")
                pass

connected_clients = 0

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins="*")
Compress(app)

sessions = {}
scraper_q = queue.Queue()
poser_q = queue.Queue()
stop_flag = StopFlag()

scraper = Scraper(
    scraper_q,
    stop_flag,
    app,
    sessions
)
scraper.start()

poser = Poser(
    poser_q,
    app
)
poser.start()


@app.route('/sessions/<path:filepath>')
def data(filepath):
    return send_from_directory('sessions', filepath)

@app.route('/session',  methods = ['POST'])
def update_session():
    try:
        params = request.get_json()
        if ('session' not in params or len(params['session']) == 0):
            raise Exception('Session cannot be empty')
        if ('socket' not in params or len(params['socket']) == 0):
            raise Exception('Socket cannot be empty')

        session_id = params['session']

        sessions[session_id] = socket

        out = jsonify(result="OK")

        return out

    except Exception as e:
        traceback.print_stack()
    return jsonify(result=str(e))

@app.route('/poseUrl',  methods = ['POST'])
def pose_url():
    try:
        params = request.get_json()
        
        # Clear the queue
        while not poser_q.empty():
            try:
                poser_q.get(False)
            except Empty:
                continue

        for url in params['urls']:
            imgParams = {
                'url': url,
                'numOfPeople': params['numOfPeople'],
                'numOfPermutations': params['numOfPermutations'],
                'keyword': params['keyword'],
                'socketSessionId': params['socketSessionId']
            }
            poser_q.put(imgParams)
        return jsonify(result="OK")

    except Exception as e:
        print("Error in route /poseUrl {}".format(str(e)))
        return jsonify(result=str(e))

@app.route('/search',  methods = ['POST'])
def search():
    try:
        params = request.get_json()
        print(params)
        timestamp = int(time.time())
        session_id = '{}-{}'.format(params['keyword'],timestamp)
        socket_id =  params['socket']
        sessions[session_id] = socket_id

        download_dir = 'server/sessions/{}'.format(session_id)
        print("Get image links to socket {}".format(socket_id))

        scraper_q.put({
            'keyword': params['keyword'],
            'download_dir': download_dir,
            'session_id': session_id
        })

        return jsonify(result="OK", dataset_session=session_id)

    except Exception as e:
        print("Error in route /search {}".format(str(e)))
        return jsonify(result=str(e))

@app.route('/stop',  methods = ['POST'])
def stop():
    try:
        stop_flag.flag()
        return jsonify(result="OK")

    except Exception as e:
        print("Error in route /search {}".format(str(e)))
        return jsonify(result=str(e))

@app.route('/test')
def testpage():
    return render_template('test.html')

@app.route('/proxy/<path:url>', methods=method_requests_mapping.keys())
def proxy(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
    requests_function = method_requests_mapping[request.method]
    request_handle = requests_function(url, stream=True, verify=False, params=request.args, headers=headers)
    response = Response(stream_with_context(request_handle.iter_content()),
                              content_type=request_handle.headers['content-type'],
                              status=request_handle.status_code)

    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    global connected_clients
    connected_clients = connected_clients + 1 
    print("Client connected {}. Total: {}".format(request.sid, connected_clients))
    emit('connected-clients',{'value': connected_clients },broadcast=True, namespace='/')
    #join_room(request.sid)
    # if(request.method=='POST'):
    #  some_json=request.get_json()
    #  return jsonify({"key":some_json})
    # else:
    #     return jsonify({"GET":"GET"})

@socketio.on('disconnect')
def on_disconnect():
    global connected_clients
    connected_clients = connected_clients - 1
    print("Client disconnected {}. Total: {}".format(request.sid, connected_clients))
    emit('connected-clients',{'value': connected_clients },broadcast=True, namespace='/')

if __name__ == '__main__':

	#print("Generating samples")
	#for t in np.arange(0, 300, 0.000001):
	#	s.gen(t)
  app.debug = True
  print('Running in environment {}'.format(app.config['ENV']))
  wsgi.server(eventlet.listen(('', 8540)), app, debug=True)

  # app.run(host = "0.0.0.0", port = 8080,debug=True)
       
    

