const WebSocket = require('ws');
const http = require('http')
const roverIp = process.env.ROVER_IP || '192.168.1.221'

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

const stopRover = function() {
  http.get('http://' + roverIp + '/x').on('error', (err) => {
      // Check if retry is needed
      console.log(error)
      }
    });;
}

const sendRover = function(apiPath) {
  http.get('http://' + roverIp + '/' + apiPath)
}

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
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 1000);
  }

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

connect();
