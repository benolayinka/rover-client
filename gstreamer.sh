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

v4l2-ctl --set-fmt-video=width=$VIDEO_WIDTH,height=$VIDEO_HEIGHT,pixelformat=4
v4l2-ctl --overlay=1
v4l2-ctl -p $VIDEO_FPS
v4l2-ctl --set-ctrl scene_mode=8 #night mode
v4l2-ctl --set-ctrl=video_bitrate=4000000 #or whatever

gst-launch-1.0 -v v4l2src \
! video/x-h264,width=$VIDEO_WIDTH,height=$VIDEO_HEIGHT,framerate=$VIDEO_FPS/1, profile=baseline \
! h264parse ! rtph264pay config-interval=1 pt=96 \
! udpsink sync=false host=$APP_HOSTNAME port=$VIDEO_PORT