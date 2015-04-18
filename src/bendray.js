var PIXI = require('pixi.js');
var Ray = require('./ray');

class BendRay extends Ray {
	constructor(origin, direction, prisms, color, refractionScale) {
		super(origin, direction, color, refractionScale);
		this.prisms = prisms;
		this.update();
		this.lastCone = [];
	}

	update() {
		var pieces = this.prisms.reduce((pieces, prism, i) => {
			var output = pieces.pop();
			//console.log(output);
			var newPieces = prism.inputRay(output);
			//console.log(newPieces);
			if (newPieces.length === 2 && i == 1) {
				//a = 1;
			}
			return pieces.concat(newPieces);
		}, [this]);
		//var prism = this.prisms[0];
		//var pieces = prism.inputRay(this);
		this.clear();
		this.blendMode = PIXI.blendModes.ADD;
		this.lineStyle(2, this.color, 1);

		this.moveTo(this.origin[0], this.origin[1]);
		pieces.forEach((piece) => {
			if (piece.end) {
				this.lineTo(piece.end[0], piece.end[1]);
			} else {
				/*this.lineTo(piece.origin[0] + piece.direction[0] * 1000,
				 piece.origin[1] + piece.direction[1] * 1000);*/
				this.lineStyle(2, 0xFFFFFF, 0);
				this.beginFill(this.color);
				var angle = piece.angle;
				var minAngle = angle - Math.PI / 128;
				var maxAngle = angle + Math.PI / 128;
				var minDir = [Math.cos(minAngle), Math.sin(minAngle)];
				var maxDir = [Math.cos(maxAngle), Math.sin(maxAngle)];
				this.lastCone = [piece.origin[0], piece.origin[1], 
								piece.origin[0] - minDir[0] * 1000, piece.origin[1] - minDir[1] * 1000,
								piece.origin[0] - maxDir[0] * 1000, piece.origin[1] - maxDir[1] * 1000];
				/*this.moveTo(piece.origin[0], piece.origin[1]);
				this.lineTo(piece.origin[0] - minDir[0] * 1000, piece.origin[1] - minDir[1] * 1000);
				this.lineTo(piece.origin[0] - maxDir[0] * 1000, piece.origin[1] - maxDir[1] * 1000);*/
				this.moveTo(this.lastCone[0], this.lastCone[1]);
				this.lineTo(this.lastCone[2], this.lastCone[3]);
				this.lineTo(this.lastCone[4], this.lastCone[5]);
				
				this.endFill();
			}
		});
	}

	get length() {
		return Math.sqrt(Math.pow(this.end[0] - this.origin[0], 2) + Math.pow(this.end[1] - this.origin[1], 2));
	}
}

module.exports = BendRay;
