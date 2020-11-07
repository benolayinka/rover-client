const Robot = require('./Robot.js')
var five = require("johnny-five");

const PIN_SERVO_TILT='A1'
const PIN_SERVO_PAN='A0'
const SERVO_TILT_MIN_ANGLE=40
const SERVO_TILT_MAX_ANGLE=150
const SERVO_TILT_START=55
const SERVO_PAN_MIN_ANGLE=45
const SERVO_PAN_MAX_ANGLE=135
const SERVO_PAN_START=90
const PIN_LEFT_MOTOR_SPEED=6
const PIN_RIGHT_MOTOR_SPEED=5
const PIN_LEFT_MOTOR_DIRECTION=8
const PIN_RIGHT_MOTOR_DIRECTION=7
const MOTOR_MAX=255

class Mars extends Robot{
	constructor() {
    super()
    var board = this.board = new five.Board({
      repl: false,
      debug: true,
     });

    board.on('ready', this.onReady)
  }

    //define everything here, so we don't crash on no board
    onReady(){
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

      // Servo to control panning
      this.servoPan = new five.Servo({
          pin: PIN_SERVO_PAN,
          range: [SERVO_PAN_MIN_ANGLE, SERVO_PAN_MAX_ANGLE],
          center: true,
          fps:5,
          startAt: SERVO_PAN_START
        });

        // Servo to control tilt
      this.servoTilt = new five.Servo({
          pin: PIN_SERVO_TILT,
          range: [SERVO_TILT_MIN_ANGLE, SERVO_TILT_MAX_ANGLE],
          center: true,
          fps:5,
          startAt: SERVO_TILT_START
       });

      let leftJoystick = (leftJoystickData)=>{
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

      let rightJoystick = (rightJoystickData)=>{
        let y = rightJoystickData.y
        let x = rightJoystickData.x

        //joystick data is -90 to 90 and five expects 0 to 180
        x+=90

        //pan servo is backwards
        x=180-x

        //straight ahead on tilt is 55, so we want 0 to be 55..
        y+=55

        //the time and steps are experimental.
        //default number of steps is 100? causes high cpu load
        this.servoTilt.to(y)
        this.servoPan.to(x)

        //this.servoTilt.to(y)
        //this.servoPan.to(x)
      }      

      this.onGamepad = (gamepadData)=>{
        if(gamepadData.leftJoystick)
          leftJoystick(gamepadData.leftJoystick)

        if(gamepadData.rightJoystick)
          rightJoystick(gamepadData.rightJoystick)

        //new gamepad
        var moveY,moveX, lookX, lookY
        moveY = moveX = lookY = lookX = 0

        const range = 90

        //back, or key s = 83
        if(gamepadData.buttonsPressed[0] || gamepadData.keysPressed['83'])
            moveY -= range

        //forward, button 1 or key w = 87
        if(gamepadData.buttonsPressed[1] || gamepadData.keysPressed['87'])
            moveY += range

        //right, or key d = 68
        if(gamepadData.keysPressed['68'])
            moveX += range

        //left, or key a = 65
        if(gamepadData.keysPressed['65'])
            moveX -= range

        //lookUp, i = 73
        if(gamepadData.keysPressed['73'])
            lookY += range

        //lookLeft, j=74
        if(gamepadData.keysPressed['74'])
            lookX -= range

        //lookDown, k=75
        if(gamepadData.keysPressed['75'])
            lookY -= range
        
        //lookRight l=76
        if(gamepadData.keysPressed['76'])
            lookX += range

        lookX += gamepadData.lookJoystickData.x
        lookY += gamepadData.lookJoystickData.y
        moveX += gamepadData.driveJoystickData.x
        moveY += gamepadData.driveJoystickData.y

        leftJoystick({x:moveX, y:moveY})
        rightJoystick({x:lookX, y:lookY})
      }

      this.emergencyStop = ()=>{
        this.motorRight.stop()
        this.motorLeft.stop()
        this.servoPan.center()
        this.servoTilt.center()
      }
    }
}

module.exports = Mars