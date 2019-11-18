require('dotenv-safe').config();
const WebSocket = require('ws');

var sendRoverKeyDown = function(key){};
var sendRoverKeyUp = function(key){};
var stopRover = function(){};

var serial_path
var baud
var scaled_speed
var have_rover = false;

if(process.env.ROVER === 'mars') {
  have_rover = true
  serial_path = "/dev/ttyACM0"
  baud = 9600
  scaled_speed = 90
}

if(process.env.ROVER === 'traxxas') {
  have_rover = true
  serial_path = "/dev/ttyUSB0"
  baud = 9600
  scaled_speed = 35
}

if(have_rover){
  const raspi = require('raspi');
  const Serial = require('raspi-serial').Serial;
   
  raspi.init(() => {
    var serial = new Serial({portId:serial_path, baudrate: baud});
    serial.open(() => {
      stopRover = function() {
        serial.write('speed 0\r')
        serial.write('steer 0\r')
      }
      sendRoverKeyUp = function(key) {
        switch(key) {
          case 'w':
          case 's':
            serial.write('speed 0\r')
            break;
          case 'a':
          case 'd':
            serial.write('steer 0\r')
            break
          default:
            console.log('unknown command')
            break
        }
      }
      sendRoverKeyDown = function(key) {
        switch(key) {
          case 'w':
            serial.write('speed ' + scaled_speed)
            break;
          case 'a':
            serial.write('steer -' + scaled_speed)
            break;
          case 's':
            serial.write('speed -' + scaled_speed)
            break;
          case 'd':
            serial.write('steer ' + + scaled_speed)
            break
          default:
            console.log('unknown command')
            break
        }
      }
    });
  });
}

//websocket connection to server
const path = 'wss://' + process.env.APP_HOSTNAME + '/ws'

function connect() {
  var ws = new WebSocket(path);

  ws.onopen = function() {
    console.log('websocket open!');
    hello = {event: "message", message: process.env.ROVER + " rover connected!"};
    ws.send(JSON.stringify(hello));
  }

  ws.onmessage = function(e) {
    d = JSON.parse(e.data)
    console.log(d)
    if(d.event === "keyUp")
    {
      //send stop command
      sendRoverKeyUp(d.key)
    }
    else if(d.event === "keyDown")
    {
      sendRoverKeyDown(d.key)
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
