require('dotenv-safe').config();
const winston = require('winston')
const WebSocket = require('ws');

//can add log file to transports.
//to display all msgs to console, disable silent
winston.add(new winston.transports.Console({ silent: true }))
//winston.add(new winston.transports.File({ filename: 'logfile.log' }))

var robot = null;

if(process.env.ROVER){
  var five = require("johnny-five");
  var board = new five.Board();

  try {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const imp = require('./robots/' + capitalizeFirstLetter(process.env.ROVER) + '.js')
    robot = new imp(board)
  }
  catch(e) {
    const imp = require('./robots/' + process.env.ROVER + '.js')
    robot = new imp(board)
  }
}

//websocket connection to server
const path = 'wss://' + process.env.APP_HOSTNAME + '/ws'

function connect() {
  var ws = new WebSocket(path);

  ws.onopen = function() {
    winston.info('websocket open!');
    hello = {event: "message", message: process.env.ROVER + " rover connected!"};
    ws.send(JSON.stringify(hello));
  }

  ws.onmessage = function(e) {
    d = JSON.parse(e.data)
    winston.info(d)
    if(d.rover === process.env.ROVER || d.rover === 'Debug') {
      if(d.event === 'stop'){
        if (typeof robot.emergencyStop === "function") { 
            robot.emergencyStop();
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
    winston.info('Socket is closed. Stopping rover and reconnecting.', e.reason);
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


