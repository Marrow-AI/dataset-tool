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

parser = argparse.ArgumentParser(description='Marrow Dataset tool server')

#parser.add_argument('--dummy', action='store_true' , help='Use a Dummy GAN')
    
args = parser.parse_args()

app = Flask(__name__, template_folder='../test-client')
Compress(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/session',  methods = ['POST'])
def shuffle():
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


