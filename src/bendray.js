var PIXI = require('pixi.js');
var Ray = require('./ray');

class BendRay extends Ray {
	constructor(origin, direction, prisms, color, refractionScale) {
		super(origin, direction, color, refractionScale);
		this.prisms = prisms;
		this.update();
		this.pieces = [];
		this.hitPrism = false;
	}

	update() {
		var pieces = [this];
		var prisms = this.prisms.slice(0); //clone
		var piece = pieces[pieces.length - 1];
		prisms.sort((a, b) => {
			var distanceA = Math.pow(a.position.x - piece.origin[0], 2) + Math.pow(a.position.y - piece.origin[1], 2);
			var distanceB = Math.pow(b.position.x - piece.origin[0], 2) + Math.pow(b.position.y - piece.origin[1], 2);
			return distanceA - distanceB;
		});
		while (prisms.length) {
			var prism = prisms.shift();
			var inputPiece = pieces.pop();
			var newPieces = prism.inputRay(inputPiece);
			if (newPieces.length > 1) {
				// retry all prisms on hit
				prisms = this.prisms.slice(0);
				piece = newPieces[newPieces.length - 1];
				prisms.sort((a, b) => {
					var distanceA = Math.pow(a.position.x - piece.origin[0], 2) + Math.pow(a.position.y - piece.origin[1], 2);
					var distanceB = Math.pow(b.position.x - piece.origin[0], 2) + Math.pow(b.position.y - piece.origin[1], 2);
					return distanceA - distanceB;
				});
			}
			pieces = pieces.concat(newPieces);
		}
		this.pieces = pieces;


		this.hitPrism = (pieces.length > 1);
		this.clear();
		this.blendMode = PIXI.blendModes.ADD;
		this.lineStyle(2, this.color, 1);

		this.moveTo(this.origin[0], this.origin[1]);
		pieces.forEach((piece) => {
			this.lineStyle(2, piece.color, 1);
			if (piece.end) {
				this.lineTo(piece.end[0], piece.end[1]);
			} else {
				this.lineTo(piece.origin[0] + piece.direction[0] * 10000, piece.origin[1] + piece.direction[1] * 10000);
			}
		});
	}

	get currentCone() {
		return this.lastCone;
	}

	get getcolor() {
		return super.color;
	}

	get length() {
		return Math.sqrt(Math.pow(this.end[0] - this.origin[0], 2) + Math.pow(this.end[1] - this.origin[1], 2));
	}
}

module.exports = BendRay;
