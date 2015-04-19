var PIXI = require('pixi.js');
var Line = require('./line');

function rgbToH(rgb) {
	var red = rgb & 0xFF0000;
	var green = rgb & 0x00FF00;
	var blue = rgb & 0x0000FF;
	var r = red / 0xFF0000;
	var g = green / 0x00FF00;
	var b = blue / 0x0000FF;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h;

	if (max == min) {
		h = 0; // achromatic
	} else {
		var d = max - min;
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return h;
}

class Ray extends PIXI.Graphics {
	constructor(origin, direction, color) {
		super();
		this.origin = origin;
		this.direction = direction;
		this.rayColor = color;
		this.color = color;
		var h = rgbToH(this.color);

		this.colorRefractionScale = 1 - ((1 - h) / 10);
	}

	init() {
		this.clear();
		this.lineStyle(2, this.rayColor, 1);
		this.beginFill(0xFFFFFF);

		// draw a triangle using lines
		this.moveTo(this.origin[0], this.origin[1]);
		this.lineTo(this.direction[0] * 1000, this.direction[1] * 1000);

		// end the fill
		this.endFill();
	}

	getRefractionIndex(materialIndex) {
		return materialIndex * this.colorRefractionScale;
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
