var PIXI = require('pixi.js');

class Barier extends PIXI.Graphics {
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
			this.getRotatedPoint([this.barrierHeight, 0]),
			this.getRotatedPoint([this.barrierHeight, this.barrierWidth]),
			this.getRotatedPoint([0, this.barrierWidth])
		];
	}

	inputRay(ray) {
		var [line, segment] = this.intersectWithSegments(ray);
		if (!line || !segment) {
			return [ray];
		}


	}
}

module.exports = Barier;
