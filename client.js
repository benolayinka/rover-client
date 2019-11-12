const WebSocket = require('ws');

process.env.PI = process.env.PI || true;

var sendRover;
var stopRover;

if(process.env.PI){
  const raspi = require('raspi');
  const Serial = require('raspi-serial').Serial;
   
  raspi.init(() => {
    var serial = new Serial();
    serial.open(() => {
      stopRover = function() {
        serial.write('x')
      }
      sendRover = function(apiPath) {
        serial.write(apiPath);
      }
    });
  });
}

if(process.env.ESP){
  const http = require('http')
  const roverIp = process.env.ROVER_IP || '192.168.1.221'
  stopRover = function() {
    http.get('http://' + roverIp + '/x', function (res) {

    }).on('error', (err) => {
          // Check if retry is needed
          console.log(err)
          });
  }

  sendRover = function(apiPath) {
    http.get('http://' + roverIp + '/' + apiPath, function (res) {

    }).on('error', (err) => {
        // Check if retry is needed
        console.log(err)
        });
  }
}

//start streaming
const { exec } = require('child_process');
exec('gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=640, height=480, framerate=(fraction)10/1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=benolayinka.com port=8004', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    console.log('error executing command');
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

//websocket connection to server
const path = 'wss://benolayinka.com/ws'

function connect() {
  var ws = new WebSocket(path);

  ws.onopen = function() {
    console.log('websocket open!');
    hello = {event: "message", message: "pi connected!"};
    ws.send(JSON.stringify(hello));
  }

  ws.onmessage = function(e) {
    d = JSON.parse(e.data)
    console.log(d.event)
    if(d.event === "keyUp")
    {
      //send stop command
      stopRover()
    }
    else if(d.event === "keyDown")
    {
      sendRover(d.key)
    }
  }

  ws.onclose = function(e) {
    console.log('Socket is closed. Stopping rover and reconnecting.', e.reason);
    stopRover()
    setTimeout(function() {
      connect();
    }, 100);
  }

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

connect();
