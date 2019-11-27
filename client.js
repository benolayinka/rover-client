require('dotenv-safe').config();
const WebSocket = require('ws');

var sendRoverKeyDown = function(key){};
var sendRoverKeyUp = function(key){};
var stopRover = function(){};

var serial_path
var baud
var scaled_speed
var scaled_steer
var inc
var have_rover = false;
var have_arm = false;

if(process.env.ROVER === 'arm') {
  have_arm = true
  serial_path = "/dev/ttyACM0"
  baud = 9600
  inc = 10
} 

if(process.env.ROVER === 'mars') {
  have_rover = true
  serial_path = "/dev/ttyACM0"
  baud = 9600
  scaled_speed = 90
  scaled_steer = 90
}

if(process.env.ROVER === 'traxxas') {
  have_rover = true
  serial_path = "/dev/ttyUSB0"
  baud = 9600
  scaled_speed = 35
  scaled_steer = 60
}

if(have_arm) {
  serialInit()

  keysToCommand = function(keysPressed) {

    if(keysPressed.includes('w'))
      y+=inc
    if(keysPressed.includes('s'))
      y-=inc
    if(keysPressed.includes('a'))
      x+=inc
    if(keysPressed.includes('d'))
      x-=inc

    serial.write(`rel ${x} ${y} ${z}\r`)
  }
}

if(have_rover) {
  serialInit()

  keysToCommand = function(keysPressed) {
    let speed, steer
    speed = steer = 0;

    if(keysPressed.includes('w'))
      speed += scaled_speed
    if(keysPressed.includes('s'))
      speed -= scaled_speed
    if(keysPressed.includes('a'))
      steer += scaled_steer
    if(keysPressed.includes('d'))
      steer -= scaled_steer

    serial.write('speed ' + speed + '\r')
    serial.write('steer ' + steer + '\r')
  }
}

function serialInit(){
  const raspi = require('raspi');
  const Serial = require('raspi-serial').Serial;
   
  raspi.init(() => {
    var serial = new Serial({portId:serial_path, baudrate: baud});
    try {
      serial.open();
    }
    catch(e) {
      console.log(e)
    }
  }
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
    var oldKeysPressed
    if(d.event === 'keysPressed') {
      function arraysEqual(_arr1, _arr2) {
          if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
            return false;
          var arr1 = _arr1.concat().sort();
          var arr2 = _arr2.concat().sort();
          for (var i = 0; i < arr1.length; i++) {
              if (arr1[i] !== arr2[i])
                  return false;
          }
          return true;
      }
      //check for change in keys
      if(!arraysEqual(d.pressed, oldKeysPressed)){
        oldKeysPressed = d.pressed
        keysToCommand(d.pressed)
      }
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
