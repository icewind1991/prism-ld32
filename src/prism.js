var PIXI = require('pixi');
var segseg = require('segseg');
var Ray = require('./ray');
var Line = require('./line');

class Prism extends PIXI.Graphics {
	constructor() {
		super();
		this.init();
		this.refractionIndex = 0.8;
	}

	init() {
		this.beginFill(0xFFFFFF);

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
		//return [
		//	[this.position.x, this.position.y],
		//	[this.position.x - 50, this.position.y + 100],
		//	[this.position.x + 50, this.position.y + 100]
		//]
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
			return {line: null, segment: null};
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
			return [ray];
		}
		return {line: inputLines[0], segment: inputLines[0].segment};
	}

	getOutAngle(line, segment, index) {
		var angle1 = this.angleForLine(line);
		var angle2 = Math.atan2(segment[0][1] - segment[1][1],
				segment[0][0] - segment[1][0]) - 0.5 * Math.PI;// normal of segment
		//console.log(angle1 * (180 / Math.PI));
		//console.log(angle2 * (180 / Math.PI));
		var inAngle = (angle1 - angle2) % (2 * Math.PI);
		//console.log(inAngle * (180 / Math.PI));
		return Math.PI + (inAngle * index) + angle2;
	}

	angleForLine(line) {
		return Math.atan2(line.origin[1] - line.end[1],
			line.origin[0] - line.end[0]);
	}

	inputRay(ray) {
		var {line, segment} = this.intersectWithSegments(ray);
		if (!line || !segment) {
			return [ray];
		}

		var outAngle = this.getOutAngle(line, segment, ray.getRefractionIndex(this.refractionIndex));

		var direction = [Math.cos(outAngle), Math.sin(outAngle)];

		var internalRay = new Ray(line.end, direction);

		var {line: internalLine, segment: segment2} = this.intersectWithSegments(internalRay);
		if (!segment2) {
			return [line, internalRay];
		}
		// note that we invert our segment because we're comming from the inside
		var outAngle2 = this.getOutAngle(internalLine, [segment2[1], segment2[0]], 1 / ray.getRefractionIndex(this.refractionIndex));

		var direction2 = [Math.cos(outAngle2), Math.sin(outAngle2)];

		var outRay = new Ray(internalLine.end, direction2);

		var parts = [line, internalLine];

		var {line: internalLine2, segment: segment3} = this.intersectWithSegments(outRay); // internal reflection ?
		if (!internalLine2) {
			parts.push(outRay);
			return parts;
		}
		parts.push(internalLine2);
		// note that we invert our segment because we're comming from the inside
		var outAngle3 = this.getOutAngle(internalLine2, [segment3[1], segment3[0]], 1 / ray.getRefractionIndex(this.refractionIndex));


		var direction3 = [Math.cos(outAngle3), Math.sin(outAngle3)];

		var outRay2 = new Ray(internalLine2.end, direction3);
		parts.push(outRay2);

		return parts;
	}
}

module.exports = Prism;
