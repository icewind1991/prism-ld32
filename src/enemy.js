var PIXI = require('pixi.js');
var segseg = require('segseg');

class Enemy extends PIXI.Graphics {
	constructor(colour) {
		super();
		this.colour = colour;
		this.init();
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFFFFFF, 1);
		this.beginFill(this.colour);

		// draw a triangle using lines
		this.moveTo(700, 600);
		this.lineTo(700, 580);
		this.lineTo(680, 580);
		this.lineTo(680, 600);

		// end the fill
		this.endFill();
	}
}

module.exports = Enemy;
