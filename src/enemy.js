var PIXI = require('pixi.js');
var segseg = require('segseg');

class Enemy extends PIXI.Graphics {
	constructor(colour) {
		super();
		this.colour = colour;
		this.bounds = [];
		this.init();
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFFFFFF, 1);
		this.beginFill(this.colour);

		// draw a triangle using lines
		this.moveTo(800, 600);
		this.lineTo(800, 580);
		this.lineTo(780, 580);
		this.lineTo(780, 600);

		this.bounds.push(780);
		this.bounds.push(600);
		this.bounds.push(800);
		this.bounds.push(580);
		// end the fill
		this.endFill();
	}
}

module.exports = Enemy;
