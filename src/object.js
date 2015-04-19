var PIXI = require('pixi.js');

class GameObject extends PIXI.Graphics {
	getRotatedPoint(point) {
		var s = Math.sin(this.rotation);
		var c = Math.cos(this.rotation);

		// rotate point
		var xNew = point[0] * c - point[1] * s;
		var yNew = point[0] * s + point[1] * c;

		return [xNew + this.position.x, yNew + this.position.y];
	}
}

module.exports = GameObject;
