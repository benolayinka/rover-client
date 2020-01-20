require('dotenv-safe').config();
const winston = require('winston')

//can add log file to transports.
//to display all msgs to console, disable silent
winston.add(new winston.transports.Console({
  format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ), 
  silent: false 
}))

var robot = null;

if(process.env.ROVER){
  var five = require("johnny-five");

  var board = new five.Board({
    repl: false,
    debug: false,
  });

  try {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const imp = require('./robots/' + capitalizeFirstLetter(process.env.ROVER) + '.js')
    robot = new imp(board)
  }
  catch(e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        // Re-throw not "Module not found" errors 
        throw e;
    }
    const imp = require('./robots/' + process.env.ROVER + '.js')
    robot = new imp(board)
  }
}

var uuid
var available = true

var socket = require('socket.io-client')('https://benolayinka.com');
socket.on('connect', function(){
  winston.info('websocket open!');

  //send join request to enter room for rover 
  socket.emit('join', process.env.ROVER)

  //continue once we're in the room
  socket.on('joined room', ()=>{
    winston.info('joined room')

    socket.emit('robot connected', {robot: process.env.ROVER, video_port: process.env.VIDEO_PORT})

    socket.on('message', (message)=> {
      winston.info('message received', message)
      switch(message.type) {
        case 'request':
          if(available) {
            //grant request
            available = false
            uuid = message.uuid
            socket.emit('message', {
              type: 'request ack',
              requestGranted: true,
              uuid: message.uuid,
            })
            setInterval(()=>{
              available = true
            }, 1000 * 60)
          }
          else {
            socket.emit('message', {
              type: 'request ack',
              requestGranted: false,
              uuid: message.uuid,
            })
          }
          break;
        case 'controls':
          if (typeof robot.onGamepad === "function") {
             robot.onGamepad(message.data);
          }
        default:
          // code block
        }
    })
  })
});


