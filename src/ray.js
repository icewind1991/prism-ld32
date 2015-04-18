var PIXI = require('pixi');
var Line = require('./line');

class Ray extends PIXI.Graphics {
	constructor(origin, direction) {
		super();
		this.origin = origin;
		this.direction = direction;
		this.color = 0xFF0000;
		this.refractionScale = 1;
	}

	init() {
		this.clear();
		this.lineStyle(2, this.color, 1);
		this.beginFill(0xFFFFFF);

		// draw a triangle using lines
		this.moveTo(this.origin[0], this.origin[1]);
		this.lineTo(this.direction[0] * 1000, this.direction[1] * 1000);

		// end the fill
		this.endFill();
	}

	getRefractionIndex(materialIndex) {
		return materialIndex * this.refractionScale;
	}
}

module.exports = Ray;
