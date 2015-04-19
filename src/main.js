var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Enemy = require('./enemy');
var BendRay = require('./bendray');
var kd = require('keydrown');
var SAT = require('sat');
var wheel = require('wheel');
var Level = require('./level');
var renderer = new PIXI.CanvasRenderer(800, 600);


//var renderer = new PIXI.autoDetectRenderer(800, 600);

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;

var level = new Level(require('../level.json'));
level.applyToStage(stage);

requestAnimationFrame(animate);

var keypressed = false;

kd.R.down(() => {
	if (dragging != null) {
		dragging.refractionIndex += 0.01;
		if (dragging.refractionIndex > 2.5) {
			dragging.refractionIndex = 2.5;
		}
		keypressed = true;
	}
});


kd.T.down(() => {
	if (dragging != null) {
		dragging.refractionIndex -= 0.01;
		if (dragging.refractionIndex < 1) {
			dragging.refractionIndex = 1;
		}
		keypressed = true;
	}
});

var hovering = null;
var dragging = null;
var offset = [0, 0];

stage.mousedown = function () {
	if (dragging == null) {
		level.manipulators.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(stage.getMousePosition().x, stage.getMousePosition().y),
					prismToPolygon(prism))) {
				dragging = prism;
				offset = [stage.getMousePosition().x - prism.position.x, stage.getMousePosition().y - prism.position.y];
			}
		});
	}
};

stage.mouseup = function () {
	dragging = null;
	offset = [0, 0];
};

wheel(document, mouseWheelHandler);

function mouseWheelHandler(e) {
	if (hovering != null) {
		if (e.wheelDelta < 0) {
			if (!hasCollisions(hovering, hovering.position.x, hovering.position.y, hovering.rotation - 0.01)) {
				hovering.rotation -= 0.01;
				keypressed = true;
			}
		} else {
			if (!hasCollisions(hovering, hovering.position.x, hovering.position.y, hovering.rotation + 0.01)) {
				hovering.rotation += 0.01;
				keypressed = true;
			}
		}
	}
}

var oldMouse = [];

function animate() {
	kd.tick();
	//prism.rotation += 0.01;
	var newMouse = stage.getMousePosition();
	if (keypressed || newMouse.x != oldMouse.x || newMouse.y != oldMouse.y) {
		/*rays.forEach((ray)=> {
		 ray.destination = [newMouse.x, newMouse.y];
		 });*/
		if (dragging != null) {
			var dragx = newMouse.x - offset[0];
			var dragy = newMouse.y - offset[1];
			if (hasCollisions(dragging, dragx, dragy, dragging.rotation)) {
				//TODO offset
			} else {
				dragging.position.x = dragx;
				dragging.position.y = dragy;
			}
		}
		level.rays.forEach((ray)=> {
			ray.update();
		});
		oldMouse.x = newMouse.x;
		oldMouse.y = newMouse.y;
		keypressed = false;
	}

	level.enemies.forEach((enemy)=> {
		var enemyhit = false;
		level.rays.forEach((ray)=> {
			if (ray.hitPrism) {
				if (enemy.collisionCheck(ray)) {
					enemyhit = true;
					enemy.init();//update
				}
			}
		});
		if (!enemyhit) {
			enemy.regen();
			enemy.init();//update
		}
	});

	if (dragging == null) { //only check for hover updates when not dragging
		var nowhovering = false;
		level.manipulators.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(stage.getMousePosition().x, stage.getMousePosition().y),
					prismToPolygon(prism))) {
				nowhovering = true;
				hovering = prism;
			}
		});
		if (!nowhovering) {
			hovering = null;
		}
	}

	renderer.render(stage);

	requestAnimationFrame(animate);
}

function hasCollisions(prism, newx, newy, newrot) {
	var oldx = prism.position.x;
	var oldy = prism.position.y;
	var oldrot = prism.rotation;
	prism.position.x = newx;
	prism.position.y = newy;
	prism.rotation = newrot;
	var prismpoly = prismToPolygon(prism);
	var collision = false;
	level.manipulators.forEach((otherprism)=> {
		if (otherprism != prism) {
			if (SAT.testPolygonPolygon(prismpoly, prismToPolygon(otherprism))) {
				prism.position.x = oldx;
				prism.position.y = oldy;
				prism.rotation = oldrot;
				collision = true;
			}
		}
	});
	return collision;
}

function prismToPolygon(prism) {
	var points = prism.getPoints();
	return new SAT.Polygon(new SAT.Vector(),
		points.map((point)=> {
			return new SAT.Vector(point[0], point[1]);
		}));
}

