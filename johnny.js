require('dotenv-safe').config();
const winston = require('winston')

//can add log file to transports.
//to display all msgs to console, disable silent
winston.add(new winston.transports.Console({
  	silent: false 
}))

var robot = null;

if(process.env.ROVER){

  	const five = require("johnny-five");

  	const board = new five.Board({
		repl: false,
		debug: true,
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
var secondsTotal = 30
var secondsRemaining = secondsTotal

//every second, publish remaining time on uuid
function startControlTimer(){
	winston.info('starting control timer')
	countdown = setInterval(function() {
		secondsRemaining = secondsRemaining-1
		winston.info('seconds remaining ' + secondsRemaining)

		socket.emit('message', {
	  		type: 'seconds remaining',
	  		uuid: uuid,
	  		secondsRemaining: secondsRemaining,
		})

		if (secondsRemaining <= 0) {
    		clearInterval(countdown);
    		available = true
    		secondsRemaining = secondsTotal
  		}

	}, 1000)
}

function handleRequest(message){
	winston.info('handling request')
	if(available) {
		//grant request
		available = false
		uuid = message.uuid
		socket.emit('message', {
		  type: 'request ack',
		  requestGranted: true,
		  uuid: message.uuid,
		})

		startControlTimer()
	}
  	else {
		socket.emit('message', {
	  		type: 'request ack',
	 		requestGranted: false,
	  		uuid: message.uuid,
		})
  	}
}

function handleControls(message){
	if (typeof robot.onGamepad === "function") {
	 	robot.onGamepad(message.data);
  	}
}

var socket = require('socket.io-client')('https://benolayinka.com');
socket.on('connect', function(){
  	winston.info('websocket open!');

  	socket.emit('robot connected', {robot: process.env.ROVER, video_port: process.env.VIDEO_PORT})

  	//send join request to enter room for rover 
  	socket.emit('join', process.env.ROVER, function(response) {
  		winston.info('join room response: ' + response)

  		socket.on('message', (message)=> {
	  		winston.info(message)
	  		switch(message.type) {
				case 'request':
		  			handleRequest(message)
		  			break
				case 'controls':
				  	handleControls(message)
				  	break
				default:
		  			// code block
			}
		})

  	})
});


