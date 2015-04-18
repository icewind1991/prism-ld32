var PIXI = require('pixi');

class Line extends PIXI.Graphics {
	constructor(origin, end) {
		super();
		this.origin = origin;
		this.end = end;
		this.init();
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFF0000, 1);
		this.beginFill(0xFFFFFF);

		// draw a triangle using lines
		this.moveTo(this.origin[0], this.origin[1]);
		this.lineTo(this.end[0], this.end[1]);

		// end the fill
		this.endFill();
	}

	get length() {
		return Math.sqrt(Math.pow(this.end[0] - this.origin[0], 2) + Math.pow(this.end[1] - this.origin[1], 2));
	}
}

module.exports = Line;
