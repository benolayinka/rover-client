const five = require('johnny-five')

const PIN_LEFT_MOTOR_SPEED=10
const PIN_RIGHT_MOTOR_SPEED=9
const PIN_LEFT_MOTOR_DIRECTION=8
const PIN_RIGHT_MOTOR_DIRECTION=7
const PIN_LED=13

const board = new five.Board()

board.on('ready', ()=>{

	led = new five.Led(PIN_LED)

	motorRight = new five.Motor({
	  pins: {
	    pwm: PIN_RIGHT_MOTOR_SPEED,
	    dir: PIN_RIGHT_MOTOR_DIRECTION
	  }
	});

	motorLeft = new five.Motor({
	  pins: {
	    pwm: PIN_LEFT_MOTOR_SPEED,
	    dir: PIN_LEFT_MOTOR_DIRECTION
	  }
	});

	board.repl.inject({
		led,
		motorLeft,
		motorRight,
	});
}) 