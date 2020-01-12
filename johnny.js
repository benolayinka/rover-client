require('dotenv-safe').config();
const WebSocket = require('ws');

var robot = null;

if(process.env.ROVER){
  var five = require("johnny-five");
  var board = new five.Board();

  const imp = require('./robots/' + process.env.ROVER + '.js')
  robot = new imp(board)
}

//websocket connection to server
const path = 'wss://' + process.env.APP_HOSTNAME + '/ws'

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
    //ben hack
    process.env.ROVER = 'mars'
    if(d.rover === process.env.ROVER) {
      if(d.event === 'keysPressed') {
        if (typeof keysToCommand === "function") { 
              keysToCommand(d.pressed)
          }
      }
      else if(d.event === 'joystick') {
        if (typeof joystickToCommand === "function") { 
              joystickToCommand(d.x, d.y, d.max)
          }
      }
      else if(d.event === 'stop'){
        if (typeof stopRover === "function") { 
            stopRover();
        }
      }
      else if(d.event === 'controls'){
        if (typeof robot.onGamepad === "function") { 
            robot.onGamepad(d.data);
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

connect();


