require('dotenv-safe').config();
const WebSocket = require('ws');

var serial_path
var baud
var scaled_speed
var scaled_steer
var inc
var have_rover = false;
var have_arm = false;

var serial

if(process.env.ROVER === 'arm') {
  have_arm = true
  serial_path = "/dev/ttyUSB0"
  baud = 9600
  inc = 5
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
    let x, y, z
    x = y = z = 0

    if(keysPressed.includes('w') || keysPressed.includes('ArrowUp'))
      y+=inc
    if(keysPressed.includes('s') || keysPressed.includes('ArrowDown'))
      y-=inc
    if(keysPressed.includes('d') || keysPressed.includes('ArrowRight'))
      x+=inc
    if(keysPressed.includes('a') || keysPressed.includes('ArrowLeft'))
      x-=inc
    console.debug(`writing x ${x} y ${y} and z ${z}`)
    serial.write(`rel ${x} ${y} ${z}\r`)
  }
}

if(have_rover) {
  serialInit()

  keysToCommand = function(keysPressed) {
    let speed, steer
    speed = steer = 0;

    if(keysPressed.includes('w') || keysPressed.includes('ArrowUp'))
      speed += scaled_speed
    if(keysPressed.includes('s') || keysPressed.includes('ArrowDown'))
      speed -= scaled_speed
    if(keysPressed.includes('d') || keysPressed.includes('ArrowRight'))
      steer += scaled_steer
    if(keysPressed.includes('a') || keysPressed.includes('ArrowLeft'))
      steer -= scaled_steer

    console.debug(`writing speed ${speed} and steer ${steer}`)
    serial.write('speed ' + speed + '\r')
    serial.write('steer ' + steer + '\r')
  }

  //x, y, and maximum joystick travel distance
  joystickToCommand = function(x,y, max) {
    let speed, steer
    speed = steer = 0;

    speed = map(x, -max, max, -scaled_steer, scaled_steer);
    steer = map(y, -max, max, -scaled_speed, scaled_speed);
    
    console.debug(`writing speed ${speed} and steer ${steer}`)
    serial.write('speed ' + speed + '\r')
    serial.write('steer ' + steer + '\r')

    function map( x,  in_min,  in_max,  out_min,  out_max){
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
  }
}

function serialInit(){
  const raspi = require('raspi');
  const Serial = require('raspi-serial').Serial;

  function stopRover(){
    serial.write('stop\r')
  }
   
  raspi.init(() => {
    serial = new Serial({portId:serial_path, baudrate: baud});
    try {
      serial.open();
    }
    catch(e) {
      console.debug(e)
    }
  })
}

//websocket connection to server
const path = 'wss://' + process.env.APP_HOSTNAME + '/ws'

var oldKeysPressed = []

function connect() {
  var ws = new WebSocket(path);

  ws.onopen = function() {
    console.debug('websocket open!');
    hello = {event: "message", message: process.env.ROVER + " rover connected!"};
    ws.send(JSON.stringify(hello));
  }

  ws.onmessage = function(e) {
    d = JSON.parse(e.data)
    console.debug(d)
    if(d.rover === process.env.ROVER) {
      if(d.event === 'keysPressed') {
        if (typeof keysToCommand === "function") { 
              keysToCommand(d.pressed)
          }
        //check for change in keys - disabled
        // if(!arraysEqual(d.pressed, oldKeysPressed)){
        //   oldKeysPressed = d.pressed.slice()
        //   if (typeof keysToCommand === "function") { 
        //       keysToCommand(d.pressed)
        //   }
        // }
      }
      else if(d.event = 'joystick') {
        if (typeof joystickToCommand === "function") { 
              joystickToCommand(d.x, d.y, d.max)
          }
      }
    }
  }

  ws.onclose = function(e) {
    console.debug('Socket is closed. Stopping rover and reconnecting.', e.reason);
    if (typeof stopRover === "function") { 
        stopRover();
    }
    setTimeout(function() {
      connect();
    }, 100);
  }

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

//helper to deep compare two arrays
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

connect();


