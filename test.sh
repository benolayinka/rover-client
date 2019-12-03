#!/bin/sh

# Load up .env
set -o allexport
[[ -f .env ]] && source .env
set +o allexport

gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=1280, height=720, framerate=(fraction)10/1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=benolayinka.com port=$VIDEO_PORT