var PIXI = require('pixi.js');
var segseg = require('segseg');

class Enemy extends PIXI.Graphics {
	constructor(colour, bottomright, topleft) {
		super();
		this.originalColour = colour;
		this.currentColour = this.originalColour;
		this.bottomright = bottomright;
		this.topleft = topleft;
		this.init();
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFFFFFF, 1);

		this.beginFill(this.currentColour);

		this.moveTo(this.bottomright[0], this.bottomright[1]);
		this.lineTo(this.bottomright[0], this.topleft[1]);
		this.lineTo(this.topleft[0], this.topleft[1]);
		this.lineTo(this.topleft[0], this.bottomright[1]);
		// end the fill
		this.endFill();
	}

	hit(colour) {
		var red = this.currentColour & 0xFF0000;
		var green = this.currentColour & 0x00FF00;
		var blue = this.currentColour & 0x0000FF;
		var newRed = colour & 0xFF0000;
		var newGreen = colour & 0x00FF00;
		var newBlue = colour & 0x0000FF;
		newRed = newRed / 100;
		newGreen = newGreen / 100;
		newBlue = newBlue / 100;
		red = Math.max(0, red - newRed);
		green = Math.max(0, green - newGreen);
		blue = Math.max(0, blue - newBlue);
		this.currentColour = (red & 0xFF0000) + (green & 0x00FF00) + (blue & 0x0000FF);
		if (this.currentColour < 0) {
			this.currentColour = 0;
		}
	}
	
	regen() {
		var red = this.currentColour & 0xFF0000;
		var green = this.currentColour & 0x00FF00;
		var blue = this.currentColour & 0x0000FF;
		var newRed = this.originalColour & 0xFF0000;
		var newGreen = this.originalColour & 0x00FF00;
		var newBlue = this.originalColour & 0x0000FF;
		newRed = newRed / 10;
		newGreen = newGreen / 10;
		newBlue = newBlue / 10;
		red = Math.min(0xFF0000, red + newRed);
		green = Math.min(0x00FF00, green + newGreen);
		blue = Math.min(0x0000FF, blue + newBlue);
		this.currentColour = (red & 0xFF0000) + (green & 0x00FF00) + (blue & 0x0000FF);
		if (this.currentColour > this.colour) {
			this.currentColour = this.colour;
		}
	}
}

module.exports = Enemy;
