const WebSocket = require('ws');
const http = require('http')
const roverIp = process.env.ROVER_IP || '192.168.1.221'

if(process.env.WS)
{
  const { exec } = require('child_process');
  exec('gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=640, height=480, framerate=(fraction)10/1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=benolayinka.com port=8004', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });

  // const {spawn} = require('child_process');
  // const ls = spawn('gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=640, height=480, framerate=(fraction)10/1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=benolayinka.com port=8004');

  // ls.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });

  // ls.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // ls.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
}

const path = 'wss://benolayinka.com/ws'

const ws = new WebSocket(path);

ws.on('open', function open() {
  ws.send(JSON.stringify({event: "message", message: "pi connected!"}));
});

ws.on('message', function incoming(json) {
  console.log('Received json: ', json);
  data = JSON.parse(json)
  console.log(data.message)
  if(data.event === "keyUp")
  {
    //send stop command
    http.get('http://' + roverIp + '/x');
  }
  else if(data.event === "keyDown")
  {
    http.get('http://' + roverIp + '/' + data.key);
  }
});