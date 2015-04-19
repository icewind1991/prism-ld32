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
		this.rays = [];
	}

	applyToStage(stage) {
		this.manipulators.forEach((manipulator) => {
			stage.addChild(manipulator);
		});

		this.enemies.forEach((enemy)=> {
			console.log(enemy);
			stage.addChild(enemy);
		});

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
}

module.exports = Level;
