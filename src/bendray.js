var PIXI = require('pixi.js');
var Ray = require('./ray');

class BendRay extends Ray {
	constructor(origin, direction, prism, color, refractionScale) {
		super(origin, direction, color, refractionScale);
		this.prism = prism;
		this.update();
	}

	update() {
		var pieces = this.prism.inputRay(this);
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
				
				this.moveTo(piece.origin[0], piece.origin[1]);
				var angle = piece.angle;
				var minAngle = angle-Math.PI/128;
				var maxAngle = angle+Math.PI/128;
				var minDir = [Math.cos(minAngle), Math.sin(minAngle)];
				var maxDir = [Math.cos(maxAngle), Math.sin(maxAngle)];
				this.lineTo(piece.origin[0] - minDir[0] * 1000, piece.origin[1] - minDir[1] * 1000);
				this.lineTo(piece.origin[0] - maxDir[0] * 1000, piece.origin[1] - maxDir[1] * 1000);
				
				this.endFill();
			}
		});
	}

	get length() {
		return Math.sqrt(Math.pow(this.end[0] - this.origin[0], 2) + Math.pow(this.end[1] - this.origin[1], 2));
	}
}

module.exports = BendRay;
