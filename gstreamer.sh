#!/bin/bash

# Load up .env
set -o allexport
[[ -f .env ]] && source .env
set +o allexport

echo "Streaming to.."
echo "APP_HOSTNAME = "
echo "$APP_HOSTNAME"
echo "PORT = "
echo "$VIDEO_PORT"

gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=$VIDEO_WIDTH, height=$VIDEO_HEIGHT, framerate=(fraction) $VIDEO_FPS /1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=$APP_HOSTNAME port=$VIDEO_PORT