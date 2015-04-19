var PIXI = require('pixi.js');
var Manipulator = require('./manipulator');
var Ray = require('./ray');

class Mirror extends Manipulator {
	constructor(width, height) {
		super();
		this.mirrorWidth = width;
		this.mirrorHeight = height;
		this.color = 0xFFFFFF;
		this.init();
	}

	init() {
		this.clear();

		this.beginFill(this.color, 1);

		this.drawRect(0, 0, this.mirrorWidth, this.mirrorHeight);

		this.endFill();
	}

	getPoints() {
		return [
			this.getRotatedPoint([0, 0]),
			this.getRotatedPoint([0, this.mirrorHeight]),
			this.getRotatedPoint([this.mirrorWidth, this.mirrorHeight]),
			this.getRotatedPoint([this.mirrorWidth, 0])
		];
	}
	
	inputRay(ray) {
		if (!ray.getRefractionIndex) {
			return [ray];
		}
		var [line, segment] = this.intersectWithSegments(ray);
		if (!line || !segment) {
			return [ray];
		} else {
			var parts = [line];
			var outAngle = this.getOutAngle(line, segment, 1 / ray.getRefractionIndex(this.refractionIndex));
			var direction = [Math.cos(outAngle), Math.sin(outAngle)];
			var outRay = new Ray(line.end, direction, ray.rayColor, ray.refractionScales);
			parts.push(outRay);
			return parts;
		}
	}
	
	getOutAngle(line, segment, index) {
		var angle1 = line.angle;
		var angle2 = Math.atan2(segment[0][1] - segment[1][1],
				segment[0][0] - segment[1][0]) - 0.5 * Math.PI;// normal of segment
		var inAngle = (angle1 - angle2) % (2 * Math.PI);
		return angle2 - inAngle;
	}
}

module.exports = Mirror;
