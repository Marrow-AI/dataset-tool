#!/usr/bin/env python
# -*- coding: utf-8

import sys

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

from flask import Flask, jsonify, request, render_template, send_file
from flask_compress import Compress

import argparse
import json
import traceback

import urllib.request
import urllib.error
from urllib.parse import quote

from multiprocessing import Pool
from user_agent import generate_user_agent

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

parser = argparse.ArgumentParser(description='Marrow Dataset tool server')

#parser.add_argument('--dummy', action='store_true' , help='Use a Dummy GAN')
    
args = parser.parse_args()

app = Flask(__name__, template_folder='../test-client')
Compress(app)


def get_image_links(main_keyword, download_dir, num_requested = 100):
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

    img_urls = set()
    driver = webdriver.Firefox()
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
            time.sleep(1)
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
                print("Found image url: " + url)

    print('Process-{0} totally get {1} images'.format(main_keyword, len(img_urls)))
    driver.quit()


def download_images(main_keyword,download_dir):
    image_links = set()
    print('Process {0} Main keyword: {1}'.format(os.getpid(), main_keyword))

    # create a directory for a main keyword
    img_dir =  download_dir + '/raw'
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    search_query = quote(main_keyword)
    url = 'https://www.google.com/search?q=' + search_query + '&source=lnms&tbm=isch'
    image_links = image_links.union(parse_page(url))
    print('Process {0} get {1} links so far'.format(os.getpid(), len(image_links)))

    print ("Start downloading...")
    count = 1
    for link in image_links:
        try:
            print(link['src'])
            """
            req = urllib.request.Request(link, headers = {"User-Agent": generate_user_agent()})
            response = urllib.request.urlopen(req)
            data = response.read()
            file_path = img_dir + '{0}.jpg'.format(count)
            with open(file_path,'wb') as wf:
                wf.write(data)
            print('Process {0} fininsh image {1}/{2}.jpg'.format(os.getpid(), main_keyword, count))
            count += 1
            """
        except urllib.error.URLError as e:
            logging.error('URLError while downloading image {0}\nreason:{1}'.format(link, e.reason))
            continue
        except urllib.error.HTTPError as e:
            logging.error('HTTPError while downloading image {0}\nhttp code {1}, reason:{2}'.format(link, e.code, e.reason))
            continue
        except Exception as e:
            logging.error('Unexpeted error while downloading image {0}\nerror type:{1}, args:{2}'.format(link, type(e), e.args))
            continue

    print("Finish downloading, total {0} errors".format(len(image_links) - count))

    print("Done")
    

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/session',  methods = ['POST'])
def create_session():
    try:
        params = request.get_json()
        print(params)
        timestamp = int(time.time())
        session_id = '{}-{}'.format(params['keyword'],timestamp)

        if ('keyword' not in params or len(params['keyword']) == 0):
            raise Exception('Keyword cannot be empty')
        try:
            os.mkdir('sessions/{}'.format(session_id))
            
        except FileExistsError:
            pass
        
        out = jsonify(result="OK")
        out.set_cookie('dataset_session', session_id)

        return out

    except Exception as e:
        traceback.print_stack()
        return jsonify(result=str(e))

@app.route('/search',  methods = ['POST'])
def search():
    try:
        params = request.get_json()
        print(params)
        session_id = request.cookies.get('dataset_session')

        if ('keyword' not in params or len(params['keyword']) == 0):
            raise Exception('Keyword cannot be empty')
        
        download_dir = 'sessions/{}'.format(session_id)
        p = Pool() # number of process is the number of cores of your CPU
        #p.apply_async(get_image_links, args=(params['keyword'], download_dir))
        get_image_links(params['keyword'], download_dir)
        
        return jsonify(result="OK")

    except Exception as e:
        traceback.print_stack()
        print(e)
        return jsonify(result=str(e))

def create_session():
    try:
        params = request.get_json()
        print(params)
        timestamp = int(time.time())
        session_id = '{}-{}'.format(params['keyword'],timestamp)

        if ('keyword' not in params or len(params['keyword']) == 0):
            raise Exception('Keyword cannot be empty')
        try:
            os.mkdir('sessions/{}'.format(session_id))
            
        except FileExistsError:
            pass
        
        out = jsonify(result="OK")
        out.set_cookie('dataset_session', session_id)

        return out

    except Exception as e:
        traceback.print_stack()
        return jsonify(result=str(e))


if __name__ == '__main__':

	#print("Generating samples")
	#for t in np.arange(0, 300, 0.000001):
	#	s.gen(t)
        app.run (host = "0.0.0.0", port = 8080)


