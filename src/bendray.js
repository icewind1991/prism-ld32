var PIXI = require('pixi');
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
		this.lineStyle(2, this.color, 1);
		//this.beginFill(0xFFFFFF);
		this.moveTo(this.origin[0], this.origin[1]);
		pieces.forEach((piece) => {
			if (piece.end) {
				this.lineTo(piece.end[0], piece.end[1]);
			} else {
				this.lineTo(piece.origin[0] + piece.direction[0] * 1000,
					piece.origin[1] + piece.direction[1] * 1000);
			}
		});
	}

	get length() {
		return Math.sqrt(Math.pow(this.end[0] - this.origin[0], 2) + Math.pow(this.end[1] - this.origin[1], 2));
	}
}

module.exports = BendRay;
