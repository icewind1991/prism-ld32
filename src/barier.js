var PIXI = require('pixi.js');
var Manipulator = require('./manipulator');
var Ray = require('./ray');

class Barier extends Manipulator {
	constructor(width, height, color) {
		super();
		this.barrierWidth = width;
		this.barrierHeight = height;
		this.color = color;
		this.init();
	}

	init() {
		this.clear();

		this.beginFill(this.color, 0.5);

		this.drawRect(0, 0, this.barrierWidth, this.barrierHeight);

		this.endFill();
	}

	getPoints() {
		return [
			this.getRotatedPoint([0, 0]),
			this.getRotatedPoint([0, this.barrierHeight]),
			this.getRotatedPoint([this.barrierWidth, this.barrierHeight]),
			this.getRotatedPoint([this.barrierWidth, 0])
		];
	}

	inputRay(ray) {

		var [line, segment] = this.intersectWithSegments(ray);
		if (!line || !segment) {
			return [ray];
		} else {
			var parts = [line];
			var newColor = ray.rayColor & this.color;
			if (newColor === 0x000000) {
				return parts;
			} else {
				var newRay = new Ray(line.end, ray.direction, newColor, ray.refractionScales);
				parts.push(newRay);
				return parts;
			}
		}
	}
}

module.exports = Barier;
