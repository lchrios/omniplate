import cv2
from matplotlib import pyplot as plt
import numpy as np
import imutils
import easyocr 
import glob
import requests
import random
import time
import math

def majorityElement( A ):
    majority = '' 
    count = 0 
    for x in A:
        if count == 0:
            majority = x
            count = 1
        elif majority == x:
            count = count +1
        else:
            count = count -1

    return majority


reader = easyocr.Reader(['en'])
#camera = cv2.VideoCapture(1) 

for i in range(432): #while true
    #img = camera.read()
    img = cv2.imread('images/Cars'+str(i)+'.png')

    # * converting to gray colorspace
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # * Noise reduction
    bfilter = cv2.bilateralFilter(gray, 22,30,30) #11, 17, 17) 

    # * Canny method to detect edges
    edges = cv2.Canny(bfilter, 30, 200)

    # * find contours from the edges
    keypoints = cv2.findContours(edges.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]


    location = []
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 10, True)
        if len(approx) == 4:
            location.append(approx)
    print(location)
    res = img
    for loc in location:
        
        res = cv2.rectangle(res, tuple(loc[0][0]), tuple(loc[2][0]), (0,255,0),3)
    
    candidates=[]

    cv2.imshow('segmeneted image',res)

    mask = np.zeros(gray.shape, np.uint8)
    for loc in location:
        image_new = cv2.drawContours(mask,[loc],0,255,-1)
        image_new = cv2.bitwise_and(img,img,mask=mask)
        (x,y) = np.where(mask == 255)
        (x1,y1) = (np.min(x),np.min(y))
        (x2,y2) = (np.max(x), np.max(y))
        cropped_image = gray[x1:x2+1,y1:y2+1]
        result = reader.readtext(cropped_image)
        if(len(result)>0):
            candidates.append(result[0][1])

    
    plate = majorityElement(candidates)
    print(plate)

    # TODO: Send via http to local api 
    # * Informacion a enviar
    #   * - plate
    #   * - timestamp
    #   * - coordenadas
    #       * - latitud
    #       * - longitud

    pload = {
        "timestamp": math.floor(time.time() * 1000),
        "coords": {
            "latitud": math.floor((random.random() * 360) - 180),
            "longitud": math.floor((random.random() * 360) - 180),
        }
    }

    r = requests.post('http://localhost:3000/plate/'+plate, json=pload)

    print(r.text)

    key = cv2.waitKey(2000)
    if key == 27:#if ESC is pressed, exit loop
        cv2.destroyAllWindows()
        break
