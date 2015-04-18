var PIXI = require('pixi.js');
var Line = require('./line');

class Manipulator extends PIXI.Graphics {
	getRotatedPoint(point) {
		var s = Math.sin(this.rotation);
		var c = Math.cos(this.rotation);

		// rotate point
		var xNew = point[0] * c - point[1] * s;
		var yNew = point[0] * s + point[1] * c;

		return [xNew + this.position.x, yNew + this.position.y];
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
}

module.exports = Manipulator;