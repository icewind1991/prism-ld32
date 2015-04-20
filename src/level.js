var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var BendRay = require('./bendray');
var Barier = require('./barier');
var Mirror = require('./mirror');
var Enemy = require('./enemy');

class Level {
	constructor(json) {
		this.json = json;
		this.prisms = this.json.prisms.map((def) => {
			var prism = new Prism();
			prism.position.x = def.x;
			prism.position.y = def.y;
			prism.rotation = def.rotation;
			return prism;
		});
		this.filters = this.json.filters.map((def) => {
			var filter = new Barier(def.width, def.height, parseInt(def.color, 16));
			filter.position.x = def.x;
			filter.position.y = def.y;
			filter.rotation = def.rotation;
			return filter;
		});
		this.mirrors = this.json.mirrors.map((def) => {
			var mirror = new Mirror(def.width, def.height);
			mirror.position.x = def.x;
			mirror.position.y = def.y;
			mirror.rotation = def.rotation;
			return mirror;
		});
		this.enemies = this.json.enemies.map((def) => {
			return new Enemy([def.x, def.y], [def.x + def.width, def.y + def.height], parseInt(def.color, 16));
		});
		this.manipulators = this.prisms.concat(this.filters, this.mirrors);
		this.objects = this.manipulators.concat(this.enemies);
		this.rays = [];
		this.scene = new PIXI.DisplayObjectContainer();
		this.applyToScene(this.scene);
	}

	applyToScene(stage) {
		this.manipulators.forEach((manipulator) => {
			stage.addChild(manipulator);
		});

		this.enemies.forEach((enemy)=> {
			stage.addChild(enemy);
		});

		if (this.json.message) {
			var text = new PIXI.Text(this.json.message.text, {
				font: this.json.message.font,
				fill: this.json.message.fill
			});
			text.position.x = this.json.message.x;
			text.position.y = this.json.message.y;
			stage.addChild(text);
		}

		this.rays = [];
		var origin = this.json.light.origin;
		var dir = this.json.light.direction;
		this.rays.push(new BendRay(origin, dir, this.manipulators, 0xFF0000));//720nm
		this.rays.push(new BendRay(origin, dir, this.manipulators, 0x00FFFF));//610nm
		this.rays.push(new BendRay(origin, dir, this.manipulators, 0xFFFF00));//580nm
		this.rays.push(new BendRay(origin, dir, this.manipulators, 0x00FF00));//510nm
		this.rays.push(new BendRay(origin, dir, this.manipulators, 0x0000FF));//440nm
		this.rays.forEach((ray)=> {
			stage.addChild(ray);
		});
	}

	toJSON() {
		//[def.x, def.y], [def.x + def.width, def.y + def.height], parseInt(def.color, 16)
		var json = {};
		json.light = {
			origin   : this.rays[0].origin,
			direction: this.rays[0].direction,
		};
		json.prisms = this.prisms.map((prism) => {
			return {
				x       : prism.position.x,
				y       : prism.position.y,
				rotation: prism.rotation
			}
		});
		json.filters = this.filters.map((filter) => {
			return {
				x       : filter.position.x,
				y       : filter.position.y,
				width   : filter.barrierWidth,
				height  : filter.barrierHeight,
				color   : filter.color.toString(16),
				rotation: filter.rotation
			}
		});
		json.mirrors = this.mirrors.map((mirror) => {
			return {
				x       : mirror.position.x,
				y       : mirror.position.y,
				width   : mirror.mirrorWidth,
				height  : mirror.mirrorHeight,
				rotation: mirror.rotation
			}
		});
		json.enemies = this.enemies.map((enemy) => {
			return {
				x       : enemy.bottomright[0] + enemy.position.x,
				y       : enemy.bottomright[1] + enemy.position.y,
				width   : enemy.topleft[0] - enemy.bottomright[0],
				height  : enemy.topleft[1] - enemy.bottomright[1],
				color   : enemy.originalColour.toString(16),
				rotation: enemy.rotation
			}
		});
		return json;
	}
	
	addPrism(prism) {
		this.prisms.push(prism);
		this.scene.addChild(prism);
		this.update();
	}
	
	addMirror(mirror) {
		this.mirrors.push(mirror);
		this.scene.addChild(mirror);
		this.update();
	}
	
	addFilter(filter) {
		this.filters.push(filter);
		this.scene.addChild(filter);
		this.update();
	}
	
	addEnemy(enemy) {
		this.enemies.push(enemy);
		this.scene.addChild(enemy);
		this.update();
	}
	
	remove(object) {
		this.checkUpdate(this.prisms, object);		
		this.checkUpdate(this.filters, object);
		this.checkUpdate(this.mirrors, object);
		this.checkUpdate(this.enemies, object);		
		this.scene.removeChild(object);
		object.clear();
		this.update();
	}
	
	checkUpdate(haystack, needle) {
		var index = haystack.indexOf(needle);
		if(index >= 0) {
			haystack.splice(index, 1);			
		}
	}
	
	update() {
		this.manipulators = this.prisms.concat(this.filters, this.mirrors);
		this.objects = this.manipulators.concat(this.enemies);
		this.rays.forEach((ray)=> {
			ray.updatePrisms(this.manipulators);
		});
	}
}

module.exports = Level;
