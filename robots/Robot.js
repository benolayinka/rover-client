class Robot {
	constructor() {
	}

	onReady() {
		//create everything here
		this.onGamepad = (gamepadData)=>{
			//available
			//leftStick.x/y
			//rightStick.x/y
		}

		this.emergencyStop = () =>{
			//stop motors!
		}
	}
}

module.exports = Robot