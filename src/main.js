var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Enemy = require('./enemy');
var BendRay = require('./bendray');
var kd = require('keydrown');
var SAT = require('sat');
var wheel = require('wheel');
var Level = require('./level');

var height = document.body.clientHeight;
var width = document.body.clientWidth;
var renderer = new PIXI.CanvasRenderer(width, height);

//var renderer = new PIXI.autoDetectRenderer(800, 600);
var scale = Math.min(width / 800, height / 600);
//scale = 1;

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;

var levels = {
	0: require('../levels/level.json'),
	1: require('../levels/level0.json'),
	2: require('../levels/level1.json'),
	3: require('../levels/level2.json'),
	4: require('../levels/level3.json'),
};

stage.activeLevel = null;
function loadLevel(number) {
	if (stage.activeLevel) {
		stage.removeChild(stage.activeLevel.scene);
	}
	var level = new Level(levels[number]);
	stage.activeLevel = level;
	level.scene.scale = {x: scale, y: scale};
	stage.addChild(level.scene);
}

function hashChange() {
	var hash = window.location.hash.substr(1);
	console.log(hash);
	if (hash) {
		loadLevel(hash);
	} else {
		loadLevel(0);
	}
}
window.onhashchange = hashChange;
hashChange();

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

function getMousePosition() {
	if (currentTouchPos.x > 0) {
		newMouse = currentTouchPos;
	} else {
		var newMouse = stage.getMousePosition();
	}
	return {
		x: newMouse.x / scale,
		y: newMouse.y / scale
	};
}

stage.mousedown = function () {
	if (dragging == null) {
		var newMouse = getMousePosition();
		stage.activeLevel.manipulators.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(newMouse.x, newMouse.y),
					prismToPolygon(prism))) {
				dragging = prism;
				offset = [newMouse.x - prism.position.x, newMouse.y - prism.position.y];
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
			tryRotate(hovering, hovering.rotation - 0.01);
		} else {
			tryRotate(hovering, hovering.rotation + 0.01);
		}
		console.log(hovering.rotation);
		console.log(hovering.position.x+ ", " + hovering.position.y);
	}
}

function tryRotate(prism, newRotation) {
	if (!hasCollisions(prism, prism.position.x, prism.position.y, newRotation)) {
		prism.rotation = newRotation;
		keypressed = true;
	}
}

var currentTouchPos = {x: -1, y: -1};

document.body.addEventListener("touchstart", onTouchStart, true);
document.body.addEventListener("touchend", onTouchEnd, true);
document.body.addEventListener("touchmove", onTouchMove, true);

function onTouchStart(event) {
	currentTouchPos.x = event.touches[0].pageX;
	currentTouchPos.y = event.touches[0].pageY;
	stage.mousedown();
}

function onTouchMove(event) {
	currentTouchPos.x = event.touches[0].pageX;
	currentTouchPos.y = event.touches[0].pageY;
	if (event.touches[1]) {
		var angle = -Math.atan2(event.touches[1].pageX - event.touches[0].pageX, event.touches[1].pageY - event.touches[0].pageY) + Math.PI;
		if (dragging) {
			tryRotate(dragging, angle);
		}
		console.log(angle);
	}
}

function onTouchEnd(event) {
	currentTouchPos.x = -1;
	currentTouchPos.y = -1;
	stage.mouseup();
}

var oldMouse = [];

function animate() {
	kd.tick();
	var newMouse = getMousePosition();
	if (keypressed || newMouse.x != oldMouse.x || newMouse.y != oldMouse.y) {
		if (dragging != null) {
			var dragX = newMouse.x - offset[0];
			var dragY = newMouse.y - offset[1];
			if (hasCollisions(dragging, dragX, dragY, dragging.rotation)) {
				console.log('collide');
				//TODO offset
			} else {
				dragging.position.x = dragX;
				dragging.position.y = dragY;
			}
		}
		stage.activeLevel.rays.forEach((ray)=> {
			ray.update();
		});
		oldMouse.x = newMouse.x;
		oldMouse.y = newMouse.y;
		keypressed = false;
	}

	stage.activeLevel.enemies.forEach((enemy)=> {
		var enemyHit = false;
		stage.activeLevel.rays.forEach((ray)=> {
			if (enemy.collisionCheck(ray)) {
				enemyHit = true;
				enemy.init();//update
			}
		});
		if (!enemyHit) {
			enemy.regen();
			enemy.init();//update
		}
	});

	if (dragging == null) { //only check for hover updates when not dragging
		var nowHovering = false;
		stage.activeLevel.manipulators.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(newMouse.x, newMouse.y),
					prismToPolygon(prism))) {
				nowHovering = true;
				hovering = prism;
			}
		});
		if (!nowHovering) {
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
	stage.activeLevel.manipulators.forEach((otherprism)=> {
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

