from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

from collections import defaultdict
import argparse
import cv2
import glob
import logging
import requests
import os
import sys
import time
import json
import base64
import common
import io
import numpy as np
import gevent.monkey
gevent.monkey.patch_all()

from PIL import Image
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from scipy.misc import imresize

from caffe2.python import workspace

from detectron.core.config import assert_and_infer_cfg
from detectron.core.config import cfg
from detectron.core.config import merge_cfg_from_file
from detectron.utils.io import cache_url
from detectron.utils.logging import setup_logging
from detectron.utils.timer import Timer
import detectron.core.test_engine as infer_engine
import detectron.datasets.dummy_datasets as dummy_datasets
import detectron.utils.c2 as c2_utils

from itertools import permutations

c2_utils.import_detectron_ops()

logging.getLogger('socketio').setLevel(logging.ERROR)
logging.getLogger('engineio').setLevel(logging.ERROR)

# OpenCL may be enabled by default in OpenCV3; disable it because it's not
# thread safe and causes unwanted GPU memory allocations.
cv2.ocl.setUseOpenCL(False)

# Densepose args
cfg_file = 'configs/DensePose_ResNet50_FPN_s1x-e2e.yaml'
weights_file = 'weights/DensePose_ResNet50_FPN_s1x-e2e.pkl'
output_dir = 'DensePoseData/infer_out/'
image_ext = 'jpg'
im_or_folder = ''
workspace.GlobalInit(['caffe2', '--caffe2_log_level=0'])
setup_logging(__name__)
logger = logging.getLogger(__name__)
merge_cfg_from_file(cfg_file)
cfg.NUM_GPUS = 1
cfg.TEST.BBOX_AUG.ENABLED = False
cfg.MODEL.MASK_ON = False
cfg.MODEL.KEYPOINTS_ON = False

# weights = cache_url(args.weights, cfg.DOWNLOAD_CACHE)
assert_and_infer_cfg(cache_urls=False)
model = infer_engine.initialize_model_from_cfg(weights_file)
dummy_coco_dataset = dummy_datasets.get_coco_dataset()

# Server configs
PORT = 22100
app = Flask(__name__)
CORS(app)
#socketio = SocketIO(app)
# Pix2Pix server Configs
PUBLIC_IP = 'pix2pix'
PIX2PIX_PORT = '23100'
PIX2PIX_ROUTE = '/infer'
pix2pixURL = 'http://' + PUBLIC_IP + ':' + PIX2PIX_PORT + PIX2PIX_ROUTE

# Take in base64 string and return PIL image
def stringToImage(base64_string):
  imgdata = base64.b64decode(base64_string)
  return Image.open(io.BytesIO(imgdata))

# Convert PIL Image to an RGB image(technically a numpy array) that's compatible with opencv
def toRGB(image):
  return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)

def process_image(input_image):
  timers = defaultdict(Timer)
  t = time.time()
  image = stringToImage(input_image[input_image.find(",")+1:])
  img = toRGB(image)
  size = img.shape[:2]
  with c2_utils.NamedCudaScope(0):
    cls_boxes, cls_segms, cls_keyps, cls_bodys = infer_engine.im_detect_all(
      model, img, None, timers=timers
    )

  t2 = time.time()

  #logger.info('Inference time: {:.3f}s'.format(t2 - t))
  if cls_bodys is not None:
    (finals,num_people) = process_bodies(img, cls_boxes, cls_bodys)
    logger.info('Num of people {}'.format(num_people))
    if len(finals) > 0:
        retval, buffer = cv2.imencode('.jpg', finals[0])
        jpg_as_text = base64.b64encode(buffer)
        return jpg_as_text
    else:
      print('Skipping')
      return None
  else:
    print('Skipping')
    return None

def process_bodies(im, boxes, body_uv):
    if isinstance(boxes, list):
        box_list = [b for b in boxes if len(b) > 0]
        if len(box_list) > 0:
            boxes = np.concatenate(box_list)
        else:
            boxes = None

    IUV_fields = body_uv[1]
    #print("Shape of image {}".format(im.shape))
    K = 26

    inds = np.argsort(boxes[:,0])
    good_inds = inds[boxes[inds[:],4] >= 0.95]
    #print("Indexes {}".format(good_inds))


    good_size = np.full(good_inds.shape, True, dtype=bool)
    for i, ind in enumerate(good_inds):
        shape = IUV_fields[ind].shape
        #print("Shape {}".format(shape))
        good_size[i] = shape[2] >= 115

    #print("Shapes filter {}".format(good_size))
    real_good_inds = good_inds[good_size]
    num_people = len(real_good_inds)
    #print("Indexes {}".format(good_inds))
        
    print('Found {} people'.format(len(good_inds)))
    finals = []
    if len(real_good_inds) >= 1:
        perms = list(set(permutations(real_good_inds, len(real_good_inds))))
        np.random.shuffle(perms)
        for i in range(4):
            good_inds = perms[i]
            print("Indexes {}".format(good_inds))

    #print("Chose random 4 {}".format(good_inds))

            Final = np.zeros([512,512, 3])
            current_offset = 0

            #np.random.shuffle(good_inds)
            #print("Good index {}".format(good_inds))

            for i, ind in enumerate(good_inds):
                entry = boxes[ind,:]
                #print("Box position: {}, score: {}".format(entry[0],entry[4]))
                entry=entry[0:4].astype(int)
                ####
                output = IUV_fields[ind]
                ####
                ###
                CurrentMask = (output[0,:,:]>0).astype(np.float32)
                BlackMask = (output[0,:,:]==0)
                #print("Shape of mask {}".format(CurrentMask.shape))
                #print("Shape of output {}".format(output.shape))
                #All_Coords = np.zeros([output.shape[1],output.shape[2], 3])
                #All_Coords_Old = All_Coords[:output.shape[1],:output.shape[2],:]
                #All_Coords_Old[All_Coords_Old==0]= im[entry[1]:output.shape[1]+entry[1],entry[0]:output.shape[2]+entry[0],:][All_Coords_Old==0]
                #All_Coords[ 0 : output.shape[1], 0 : output.shape[2],:]= All_Coords_Old

                All_Coords = np.array(im[entry[1]:output.shape[1]+entry[1],entry[0]:output.shape[2]+entry[0],:])
                #cv2.imwrite(os.path.join(output_dir, 'coords{}.png'.format(ind)), All_Coords)
                #cv2.imwrite(os.path.join(output_dir, 'img{}.png'.format(ind)), im)
                All_Coords[BlackMask] = 0
                All_Coords = All_Coords.astype(np.uint8)
                resize_ratio = 128 / output.shape[2]
                #print("Resize ratio {} ({})".format(resize_ratio, output.shape[2]))
                img = cv2.resize(All_Coords, (128,int(output.shape[1] * resize_ratio)))

                #cv2.imwrite(os.path.join(output_dir, 'person{}.png'.format(ind)), img)

                Final[128:img.shape[0]+128,current_offset:img.shape[1] + current_offset,:] = img[:384,:,:]

                current_offset = current_offset + 128

            finals.append(Final)

    return (finals, num_people)

# Main
def main(input_img, with_pix2pix = False):
  image = stringToImage(input_img[input_img.find(",")+1:])
  img = toRGB(image)
  logger.info('Processing {} -> {}'.format('New Image', 'Output...'))
  timers = defaultdict(Timer)
  t = time.time()
  size = img.shape[:2]
  with c2_utils.NamedCudaScope(0):
    cls_boxes, cls_segms, cls_keyps, cls_bodys = infer_engine.im_detect_all(
      model, img, None, timers=timers
    )
  for key, timer in timers.items():
    print(key, timer.total_time)
  t2 = time.time()
  r = vis_one_image(img, 'testImage', output_dir, cls_boxes, cls_segms, cls_keyps, cls_bodys, dataset=dummy_coco_dataset, box_alpha=0.3, show_class=True, thresh=0.7, kp_thresh=2)
  t3 = time.time()
  if with_pix2pix:
    r = requests.post(pix2pixURL, data = {'data': r})
  logger.info('Inference time: {:.3f}s'.format(t2 - t))
  logger.info('Visualization time: {:.3f}s'.format(t3 - t2))
  logger.info('Pix2pix time: {:.3f}s'.format(time.time() - t3))
  return r

# --- 
# Server Routes
# --- 

# Base route, functions a simple testing 
@app.route('/')
def index():
  return jsonify(status="200", message='Densepose is running', infer_route='/infer')

@app.route('/infer', methods=['POST'])
def infer():
  print("Running infer")
  content = request.get_json(silent=True)
  results = main(content['data'], True)
  return jsonify(results=results.text)

@app.route('/pose', methods=['POST'])
def pose():
  print("Running pose!!")
  content = request.get_json(silent=True)
  results = process_image(content["data"])
  return jsonify(results=results)

"""
# When a client socket connects
@socketio.on('connect', namespace='/query')
def new_connection():
  print('Client Connect')
  emit('successful_connection', {"data": "connection established"})

# When a client socket disconnects
@socketio.on('disconnect', namespace='/query')
def disconnect():
  print('Client Disconnect')

# When a client sends data. This should call the main() function
@socketio.on('get_pose', namespace='/query')
def new_request(request):
  results = main(request["data"], False)
  emit('pose_update', {"results": results})

# When a client sends data. This should call the main() function
@socketio.on('update_request', namespace='/query')
def new_request(request):
  results = main(request["data"], True)
  emit('update_response', {"results": results.text})
"""


#if __name__ == '__main__':
#  socketio.run(app, host='0.0.0.0', port=PORT, debug=False)
