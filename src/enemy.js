var PIXI = require('pixi.js');
var segseg = require('segseg');

class Enemy extends PIXI.Graphics {
	constructor(colour) {
		super();
		this.originalColour = colour;
		this.currentColour = this.originalColour;
		this.bounds = [];
		this.init();
		
	}

	init() {
		this.clear();
		this.lineStyle(2, 0xFFFFFF, 1);
		
		this.beginFill(this.currentColour);

		this.bounds.push(800);
		this.bounds.push(600);
		this.bounds.push(780);
		this.bounds.push(580);

		this.moveTo(800, 600);
		this.lineTo(800, 580);
		this.lineTo(780, 580);
		this.lineTo(780, 600);
		// end the fill
		this.endFill();
	}
	
	hit(colour) {
		var red = colour & 0xFF0000;
		var green = colour & 0x00FF00;
		var blue = colour & 0x0000FF;		
		var red = red/0xFF0000;
		var green = green/0x00FF00;
		var blue = blue/0x0000FF;
		var red = red/100;
		var green = green/100;
		var blue = blue/100;
		this.currentColour -= red*0xFF0000 + green*0x00FF00 + blue*0x0000FF;
		if(this.currentColour < 0) {
			this.currentColour = 0;
		}
		console.log(this.currentColour);
	}	
}

module.exports = Enemy;
