const Robot = require('./Robot.js')
const Raspi = require('raspi-io').RaspiIO;
const {Board, Motor} = require("johnny-five");

const PIN_LEFT_MOTOR_SPEED=0
const PIN_RIGHT_MOTOR_SPEED=5
const PIN_LEFT_MOTOR_DIRECTION=1
const PIN_RIGHT_MOTOR_DIRECTION=3
const MOTOR_MAX=255

class Pca extends Robot{
  constructor() {
    super()
    var board = this.board = new Board({
      io: new Raspi()
    });

    board.on('ready', this.onReady)
  }

  //define everything here, so we don't crash on no board
  onReady(){
    this.motorRight = new Motor({
        pins: {
          pwm: PIN_RIGHT_MOTOR_SPEED,
          dir: PIN_RIGHT_MOTOR_DIRECTION
        },
        controller: "PCA9685",
        address: 0x40
      });

    this.motorLeft = new Motor({
        pins: {
          pwm: PIN_LEFT_MOTOR_SPEED,
          dir: PIN_LEFT_MOTOR_DIRECTION
        },
        controller: "PCA9685",
        address: 0x40
      });

    this.motorLeft.angle = this.motorRight.angle = 0

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

    this.onGamepad = (gamepadData)=>{
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
    }

    this.emergencyStop = ()=>{
      this.motorRight.stop()
      this.motorLeft.stop()
    }
  }
}

module.exports = Pca