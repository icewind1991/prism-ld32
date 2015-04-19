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
	1: require('../levels/tutorials/drag.json'),
	2: require('../levels/tutorials/mirrors.json'),
	3: require('../levels/tutorials/filters.json'),	
	4: require('../levels/tutorials/rotation.json'),
};

stage.activeLevel = null;
var levelNumber = 0;
function loadLevel(number) {
	if (stage.activeLevel) {
		stage.removeChild(stage.activeLevel.scene);
	}
	if(levels[number]) {
		var level = new Level(levels[number]);
		stage.activeLevel = level;
		level.scene.scale = {x: scale, y: scale};
		stage.addChild(level.scene);
	} 
}

function hashChange() {
	var hash = window.location.hash.substr(1);
	console.log(hash);
	if (hash) {
		levelNumber = parseInt(hash, 10);
	} else {
		levelNumber = 0;		
	}
	loadLevel(levelNumber);
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

stage.mousedown = function () {
	if (dragging == null) {
		var newMouse = stage.getMousePosition();
		newMouse = {
			x: newMouse.x /= scale,
			y: newMouse.y /= scale
		};
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
	var newMouse = stage.getMousePosition();
	newMouse = {
		x: newMouse.x / scale,
		y: newMouse.y / scale
	};
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
	
	var done = true;
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
		if(enemy.currentColour != 0x000000) {
			done = false;
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
	
	if(done) {
		if(levels[levelNumber+1]) {
			window.location.hash = "#" + (levelNumber+1);
		} else {
			alert("congratulations");
		}
	}
	
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

