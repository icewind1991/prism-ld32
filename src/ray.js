var PIXI = require('pixi');
var Line = require('./line');

class Ray extends PIXI.Graphics {
	constructor(origin, direction, color, refractionScale) {
		super();
		this.origin = origin;
		this.direction = direction;
		this.color = color;
		this.refractionScale = refractionScale;
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
	
	set destination(newDestination) {
		this.direction[0] = newDestination[0] - this.origin[0];
		this.direction[1] = newDestination[1] - this.origin[1];
	}
	
	get angle() {
		return Math.atan2(-this.direction[1], -this.direction[0]);
	}
}

module.exports = Ray;
