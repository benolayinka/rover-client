require('dotenv-safe').config();
const winston = require('winston')

//can add log file to transports.
//to display all msgs to console, disable silent
winston.add(new winston.transports.Console({
  	silent: false 
}))

var robot = null;

if(process.env.ROVER){
	function capitalizeFirstLetter(string) {
	  return string.charAt(0).toUpperCase() + string.slice(1);
	}
	const imp = require('./robots/' + capitalizeFirstLetter(process.env.ROVER) + '.js')
	robot = new imp()
}

//exclusive control data
var uuid
var available = true
var secondsTotal = 30
var secondsRemaining = secondsTotal

var timerActive = false

//every second, publish remaining time on uuid
function startControlTimer(){

	if(timerActive) return

	timerActive = true

	winston.info('starting control timer')

	countdown = setInterval(function() {

		if(available) {

			socket.emit('message', {
		  		type: 'available',
			})

		} else {

			secondsRemaining--
			winston.info('seconds remaining ' + secondsRemaining)

			socket.emit('message', {
		  		type: 'seconds remaining',
		  		uuid: uuid,
		  		secondsRemaining: secondsRemaining,
			})

			if (secondsRemaining <= 0) {
	    		available = true
	    		uuid = null
	    		secondsRemaining = secondsTotal

	    		winston.info('stopping')

	    		if (typeof robot.emergencyStop === "function") {
				 	robot.emergencyStop();
			  	}
	  		}
		}
	}, 1000)
}

function handleMessage(message){
	switch(message.type) {
		case 'request':
			handleRequest(message)
			break
		case 'controls':
		  	handleControls(message)
		  	break
		default:
			break
	}
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
	winston.info('handling controls')
	if(available || message.uuid === uuid || message.uuid === 'debug') {
		winston.info('controls available')
		if (typeof robot.onGamepad === "function") {
			winston.info('controls!!')
		 	robot.onGamepad(message.data);
	  	}
	}
}

var socket = require('socket.io-client')('https://' + process.env.APP_HOSTNAME);

socket.on('connect', function(){

	winston.info('websocket open!');

  	socket.emit('robot connected', {robot: process.env.ROVER, video_port: process.env.VIDEO_PORT})
  	
  	//send join request to enter room for rover 
  	socket.emit('join', process.env.ROVER, function(response) {
  		
  		winston.info('join room response: ' + response)
  		
  		startControlTimer()
  	})
});

socket.on('message', (message)=> {

	winston.info(message)

	handleMessage(message)
})


