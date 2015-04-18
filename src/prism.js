var PIXI = require('pixi.js');
var segseg = require('segseg');
var Ray = require('./ray');
var Line = require('./line');

class Prism extends PIXI.Graphics {
	constructor() {
		super();
		this.init();
		this.refractionIndex = 2;
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFFFFFF, 1);
		this.beginFill(0x000000);

		// draw a triangle using lines
		this.moveTo(0, -50);
		this.lineTo(-50, 50);
		this.lineTo(50, 50);

		// end the fill
		this.endFill();
	}

	getRotatedPoint(point) {
		var s = Math.sin(this.rotation);
		var c = Math.cos(this.rotation);

		// rotate point
		var xNew = point[0] * c - point[1] * s;
		var yNew = point[0] * s + point[1] * c;

		return [xNew + this.position.x, yNew + this.position.y];
	}

	getPoints() {
		return [
			this.getRotatedPoint([0, -50]),
			this.getRotatedPoint([-50, 50]),
			this.getRotatedPoint([50, 50])
		];
	}

	getSegments() {
		var points = this.getPoints();
		return points.map((point, i) => {
			var nextI = (i + 1) % points.length;
			return [point, points[nextI]];
		});
	}

	intersectWithSegments(ray) {
		var segments = this.getSegments();
		var lineSeg = [[ray.origin[0], ray.origin[1]], [ray.origin[0] + (ray.direction[0] * 1000), ray.origin[1] + (ray.direction[1] * 1000)]];
		var intersections = segments.map((segment) => {
			var point = segseg(
				segment[0][0], segment[0][1], segment[1][0], segment[1][1],
				lineSeg[0][0], lineSeg[0][1], lineSeg[1][0], lineSeg[1][1]
			);
			if (point && point.length) {
				return {point, segment}
			} else {
				return false;
			}
		}).filter((intersection) => {
			return (intersection);
		});
		if (intersections.length === 0) {
			return [null, null];
		}
		var inputLines = intersections.map((intersection) => {
			var line = new Line(ray.origin, intersection.point);
			line.segment = intersection.segment;
			return line;
		}).filter((line) => {
			return line.length > 0.01;
		});
		inputLines.sort((a, b) => {
			return a.length - b.length;
		});
		if (!inputLines[0]) {
			return [ray, null];
		}
		return [inputLines[0], inputLines[0].segment];
	}

	getOutAngle(line, segment, index) {
		var angle1 = this.angleForLine(line);
		var angle2 = Math.atan2(segment[0][1] - segment[1][1],
				segment[0][0] - segment[1][0]) - 0.5 * Math.PI;// normal of segment
		var inAngle = (angle1 - angle2) % (2 * Math.PI);
		if (inAngle > Math.PI) {
			inAngle -= 2 * Math.PI;
		}
		return Math.PI + (inAngle / index) + angle2;
	}

	angleForLine(line) {
		return line.angle;
	}

	inputRay(ray) {
		var [line, segment] = this.intersectWithSegments(ray);
		if (!line || !segment) {
			return [ray];
		}

		var outAngle = this.getOutAngle(line, segment, ray.getRefractionIndex(this.refractionIndex));

		var direction = [Math.cos(outAngle), Math.sin(outAngle)];

		var internalRay = new Ray(line.end, direction);

		var [newInternalLine, segment2] = this.intersectWithSegments(internalRay);
		if (!segment2 || !newInternalLine) {
			return [line, internalRay];
		}
		var outRay;
		var parts = [line];
		var i = 0;

		// internal reflection
		while (newInternalLine && segment2) {
			var internalLine = newInternalLine;
			segment = segment2;
			parts.push(internalLine);

			// note that we invert our segment because we're comming from the inside
			//console.log(segment2);
			outAngle = this.getOutAngle(internalLine, [segment[1], segment[0]], 1 / ray.getRefractionIndex(this.refractionIndex));

			direction = [Math.cos(outAngle), Math.sin(outAngle)];
			internalRay = new Ray(internalLine.end, direction);
			if (i < 100) {
				[newInternalLine, segment2] = this.intersectWithSegments(internalRay);
			} else {
				newInternalLine = null;
			}
			i++;
		}

		outAngle = this.getOutAngle(internalLine, [segment[1], segment[0]], 1 / ray.getRefractionIndex(this.refractionIndex));
		//
		//
		direction = [Math.cos(outAngle), Math.sin(outAngle)];
		//
		outRay = new Ray(internalLine.end, direction, ray.color, ray.refractionScale);
		parts.push(outRay);

		return parts;
	}
}

module.exports = Prism;
