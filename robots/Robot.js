class Robot {
	constructor(board) {
		this.board = board
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