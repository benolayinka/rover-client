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

if [ "$VIDEO_ROTATION" -gt "0" ]
	then v4l2-ctl --set-ctrl=rotate=$VIDEO_ROTATION
fi

gst-launch-1.0 -v v4l2src \
! video/x-h264,width=$VIDEO_WIDTH,height=$VIDEO_HEIGHT,framerate=$VIDEO_FPS/1, profile=baseline \
! h264parse ! rtph264pay config-interval=1 pt=96 \
! udpsink sync=false host=$APP_HOSTNAME port=$VIDEO_PORT