const Robot = require('./Robot.js')
var five = require("johnny-five");

//const PIN_STEERING_SERVO=4 //d2 on esp
//const PIN_SPEED_SERVO=14 //d5 on esp
const PIN_STEERING_SERVO=2  //brown
const PIN_SPEED_SERVO=3 //blue
const SERVO_PWM_MIN=1000
const SERVO_PWM_MAX=2000

class Traxxas extends Robot{
	constructor(board) {
    	super(board);
  	}

    onReady(){

      // this.speedServo = new five.Servo({
      //     pin: PIN_SPEED_SERVO,
      //     pwmRange: [1000, 2000],
      //     center: true,
      //     //debug:true,
      //   });

      this.esc = new five.ESC({
        device: "FORWARD_REVERSE",   
        pin: PIN_SPEED_SERVO, 
      });

      this.steerServo = new five.Servo({
          pin: PIN_STEERING_SERVO,
          pwmRange: [1000, 2000],
          center: true,
          //debug:true,
        });

      let leftJoystick=(leftJoystickData)=>{
        let y = leftJoystickData.y
        let x = leftJoystickData.x
        let pwm = 0

        // //joystick data is -90 to 90, want positive ints
        // y+=90
        // this.speedServo.to(y)

        //esc expects percentage
        y+=90
        let throttlePercent = y / 180 * 100;
        let throttleuS = 1000 + throttlePercent * 10
        this.esc.throttle(throttleuS)

        //joystick data is -90 to 90, servo expects 0 to 180
        x+=90
        this.steerServo.to(x)
      }

      this.onGamepad=(gamepadData)=>{
        if(gamepadData.leftJoystick)
          leftJoystick(gamepadData.leftJoystick)
      }

      this.emergencyStop=()=>{
        //this.speedServo.to(90)
        this.esc.brake()
      }
    }
}

module.exports = Traxxas