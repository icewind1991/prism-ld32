var PIXI = require('pixi.js');
var Ray = require('./ray');
var Line = require('./line');

class BendRay extends Ray {
	constructor(origin, direction, prisms, color, refractionScale) {
		super(origin, direction, color, refractionScale);
		this.prisms = prisms;
		this.update();
		this.pieces = [];
	}

	update() {
		var pieces = [this];
		var prisms = this.prisms.slice(0); //clone
		var piece = pieces[pieces.length - 1];
		prisms.sort((a, b) => {
			return a.getDistance(piece) - b.getDistance(piece);
		});
		while (prisms.length) {
			var prism = prisms.shift();
			var inputPiece = pieces.pop();
			var newPieces = prism.inputRay(inputPiece);
			if (newPieces) {
				if (newPieces.length > 1) {
					// retry all prisms on hit
					prisms = this.prisms.slice(0);
					piece = newPieces[newPieces.length - 1];
					prisms.sort((a, b) => {
						return a.getDistance(piece) - b.getDistance(piece);
					});
				}
				pieces = pieces.concat(newPieces);
			} else {
				pieces.push(inputPiece);
			}
		}
		this.pieces = pieces;

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
