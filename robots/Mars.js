const Robot = require('./Robot.js')
var five = require("johnny-five");

const PIN_SERVO_TILT A1
const PIN_SERVO_PAN A0
const SERVO_PAN_MIN_PULSE 1200
const SERVO_PAN_MAX_PULSE 1800
const SERVO_TILT_MIN_PULSE 1000
const SERVO_TILT_MAX_PULSE 1800
const PIN_LEFT_MOTOR_SPEED 6
const PIN_RIGHT_MOTOR_SPEED 5
const PIN_LEFT_MOTOR_DIRECTION 8
const PIN_RIGHT_MOTOR_DIRECTION 7
const MOTOR_MAX 255
const ANGLE_MAX 90
const ANGLE_MIN -90

class Mars extends Robot{
	constructor(board) {
    	super(board);
    	this.ready = false
    	this.board.on("ready", ()=>{

    		this.ready = true

			this.motorRight = new five.Motor({
			    pins: {
			      pwm: PIN_RIGHT_MOTOR_SPEED,
			      dir: PIN_RIGHT_MOTOR_DIRECTION
			    }
			  });

			this.motorLeft = new five.Motor({
			    pins: {
			      pwm: PIN_LEFT_MOTOR_SPEED,
			      dir: PIN_LEFT_MOTOR_DIRECTION
			    }
			  });

			this.motorLeft.angle = this.motorRight.angle = 0

			let panPWMRange = [SERVO_PAN_MIN_PULSE, SERVO_PAN_MAX_PULSE]

			// Servo to control panning
			this.servoPan = new five.Servo({
			    pin: PIN_SERVO_PAN,
			    pwmRange: panPWMRange,
			    center: true
			  });

			let tiltPWMRange = [SERVO_TILT_MIN_PULSE, SERVO_TILT_MAX_PULSE]

			  // Servo to control tilt
			this.servoTilt = new five.Servo({
			    pin: PIN_SERVO_TILT,
			    range: tiltPWMRange,
			    center: true
			  });
    	})
  	}

  	leftJoystick(leftJoystickData) {
  		let y = leftJoystickData.y
  		let x = leftJoystickData.x
  		let pwm = 0

  		//motorRight
  		this.motorRight.angle = y - x
  		pwm = this.motorRight.angle * (255/90)
  		pwm = Math.round(pwm)
  		pwm = Math.min(pwm, MOTOR_MAX)
  		pwm = Math.max(pwm, -MOTOR_MAX)
  		pwm > 0 ? this.motorRight.fwd(pwm) : this.motorRight.rev(-pwm)

  		//motorLeft
  		this.motorLeft.angle = y + x
  		pwm = this.motorLeft.angle * (255/90)
  		pwm = Math.min(pwm, MOTOR_MAX)
  		pwm = Math.max(pwm, -MOTOR_MAX)
  		pwm = Math.round(pwm)
  		pwm > 0 ? this.motorLeft.fwd(pwm) : this.motorLeft.rev(-pwm)
  	}

  	rightJoystick(rightJoystickData) {
  		let y = leftJoystickData.y
  		let x = leftJoystickData.x

  		this.servoTilt.to(y)
  		this.servoPan.to(x)
  	}

  	onGamepad(gamepadData) {
  		if(!this.ready)
  			return

  		this.leftJoystick(gamepadData.leftJoystick)
  		this.rightJoystick(gamepadData.rightJoystick)
  	}
}