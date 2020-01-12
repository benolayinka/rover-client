const Robot = require('./Robot.js')
var five = require("johnny-five");

class Three extends Robot {
	constructor(board) {
    	super(board);
    	this.ready = false
    	this.board.on("ready", ()=>{

    		this.ready = true

    		//all motors spin clockwise by default
    		this.motorBack = new five.Motor({
			    pins: {
			      pwm: 9,
			      dir: 8
			    }
			  });

			this.motorRight = new five.Motor({
			    pins: {
			      pwm: 10,
			      dir: 11
			    }
			  });

			this.motorLeft = new five.Motor({
			    pins: {
			      pwm: 3,
			      dir: 2
			    }
			  });

    		this.motorBack.angle = this.motorLeft.angle = this.motorRight.angle = 0
    	})
  	}

  	leftJoystick(leftJoystickData) {
  		let y = leftJoystickData.y
  		let x = leftJoystickData.x
  		let pwm = 0

  		//motorRight
  		this.motorRight.angle = -y + x/2
  		pwm = this.motorRight.angle * (255/90)
  		pwm = Math.round(pwm)
  		console.log('pwm', pwm)
  		pwm > 0 ? this.motorRight.fwd(pwm) : this.motorRight.rev(-pwm)

  		//motorLeft
  		this.motorLeft.angle = y + x/2
  		pwm = this.motorLeft.angle * (255/90)
  		pwm = Math.round(pwm)
  		pwm > 0 ? this.motorLeft.fwd(pwm) : this.motorLeft.rev(-pwm)

  		//motorBack
  		this.motorBack.angle = -x
  		pwm = this.motorBack.angle * (255/90)
  		pwm = Math.round(pwm)
  		pwm > 0 ? this.motorBack.fwd(pwm) : this.motorBack.rev(-pwm)
  	}

  	onGamepad(gamepadData) {
  		if(!this.ready)
  			return

  		this.leftJoystick(gamepadData.leftJoystick)
  	}

}

module.exports = Three