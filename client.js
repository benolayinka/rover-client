const WebSocket = require('ws');

process.env.PI = process.env.PI || true;

var sendRover = function(key){};
var stopRover = function(){};

if(process.env.PI === "true"){
  const raspi = require('raspi');
  const Serial = require('raspi-serial').Serial;
   
  raspi.init(() => {
    //var serial = new Serial({portId:"/dev/ttyACM0", baudrate: 9600});
    var serial = new Serial({portId:"/dev/ttyUSB0", baudrate: 9600});
    serial.open(() => {
      stopRover = function() {
        serial.write('speed 0\r')
      }
      sendRover = function(apiPath) {
        switch(apiPath) {
          case 'w':
            serial.write('speed 35\r')
            // code block
            break;
          case 'a':
            serial.write('steer -50\r')
            // code block
            break;
          case 's':
            serial.write('speed 0\r')
            break;
          case 'd':
            serial.write('steer 50\r')
            break
          default:
            // code block
        }
        serial.write(apiPath);
      }
    });
  });
}

process.env.VIDEO = process.env.VIDEO || true;

if(process.env.VIDEO) {
  //start streaming
  const { exec } = require('child_process');
  exec('gst-launch-1.0 -v v4l2src device=/dev/video0 ! "video/x-raw, format=YUY2, width=1280, height=720, framerate=(fraction)10/1" ! videoconvert ! queue ! omxh264enc ! queue ! rtph264pay pt=96 config-interval=1 ! udpsink host=benolayinka.com port=8004', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log('error executing command');
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

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
    console.log(d)
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
