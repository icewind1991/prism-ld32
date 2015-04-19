var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Enemy = require('./enemy');
var BendRay = require('./bendray');
var kd = require('keydrown');
var SAT = require('sat');
var wheel = require('wheel');
var Level = require('./level');

var editMode = false;
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
	5: require('../levels/tutorials/combine.json'),
	6: require('../levels/easy/1.json'),
	7: require('../levels/easy/2.json'),
	8: require('../levels/easy/3.json'),
};

stage.activeLevel = null;
var levelNumber = 0;
var nextLevel = null;
function loadLevel(number) {
	if (stage.activeLevel) {
		stage.removeChild(stage.activeLevel.scene);
	}
	if (levels[number]) {
		var level = new Level(levels[number]);
		stage.activeLevel = level;
		level.scene.scale = {x: scale, y: scale};
		stage.addChild(level.scene);
	}
}

function hashChange() {
	var hash = window.location.hash.substr(1);
	//console.log(hash);
	if (hash) {
		levelNumber = parseInt(hash, 10);
	} else {
		levelNumber = 0;
	}
	if(wintext) {
		nextLevel = null;
		stage.removeChild(wintext);
		wintext = null;
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

kd.SPACE.press(() => {
	if(hovering != null && editMode) {
		var index = stage.activeLevel.manipulators.indexOf(hovering);
		if(index >= 0) {
			stage.activeLevel.manipulators.splice(index, 1);
			stage.activeLevel.rays.forEach((ray)=> {
				ray.updatePrisms(stage.activeLevel.manipulators);
			});
		}
		var enemyIndex = stage.activeLevel.enemies.indexOf(hovering);
		if(enemyIndex >= 0) {
			stage.activeLevel.enemies.splice(enemyIndex, 1);
		}
		hovering.clear();		
		stage.removeChild(hovering);
		if(dragging != null) {
			dragging = null;
		}	
		hovering = null;
	}
	keypressed = true;
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
	if(nextLevel != null) {	
		stage.removeChild(wintext);	
		window.location.hash = "#" + nextLevel;	
		nextLevel = null;		
	}
	if (dragging == null) {
		var newMouse = getMousePosition();
		stage.activeLevel.objects.forEach((prism)=> {
			if ((editMode || prism.isDragable) && SAT.pointInPolygon(new SAT.Vector(newMouse.x, newMouse.y),
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

wheel(document, function (e) {
	var rotateFactor = 0;
	if(e.deltaY) {//ff
		rotateFactor = e.deltaY / 3;
	}
	if(e.wheelDelta) {//chrome
		rotateFactor = e.wheelDelta / 120;
	}
	if (hovering != null) {
		tryRotate(hovering, hovering.rotation + (0.01 * rotateFactor));
	}
});

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
	}
}

function onTouchEnd(event) {
	currentTouchPos.x = -1;
	currentTouchPos.y = -1;
	stage.mouseup();
}

var oldMouse = [];
var wintext = null;

function animate() {
	kd.tick();
	var newMouse = getMousePosition();
	if (keypressed || newMouse.x != oldMouse.x || newMouse.y != oldMouse.y) {
		if (dragging != null) {
			var dragX = newMouse.x - offset[0];
			var dragY = newMouse.y - offset[1];
			if (!hasCollisions(dragging, dragX, dragY, dragging.rotation)) {
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
		if (enemy.currentColour != 0x000000) {
			done = false;
		}
	});

	if (dragging == null) { //only check for hover updates when not dragging
		var nowHovering = false;
		stage.activeLevel.objects.forEach((prism)=> {
			if ((editMode || prism.isDragable) && SAT.pointInPolygon(new SAT.Vector(newMouse.x, newMouse.y),
					prismToPolygon(prism))) {
				nowHovering = true;
				hovering = prism;
			}
		});
		if (!nowHovering) {
			hovering = null;
		}
	}
	
	if(done) {
		if(nextLevel == null) {
			if(levels[levelNumber+1]) {				
				wintext = new PIXI.Text("Click for next level", {
					font: "100px Arial",
					fill: 'white',
				});
				nextLevel = (levelNumber + 1);
			} else {
				wintext = new PIXI.Text("Congratulations", {
					font: "100px Arial",
					fill: 'white',
				});	
				nextLevel = 1;
			}
			wintext.position.x = 50;
			wintext.position.y = 50;
			stage.addChild(wintext);
		}
	}
	
	renderer.render(stage);	
	
	requestAnimationFrame(animate);
}

//check collision or outside playing field
function hasCollisions(prism, newx, newy, newrot) {	
	var collision = false;
	var oldx = prism.position.x;
	var oldy = prism.position.y;
	var oldrot = prism.rotation;
	prism.position.x = newx;
	prism.position.y = newy;
	prism.rotation = newrot;
	
	var points = prism.getPoints();
	points.forEach((point)=> {
		if(point[0] < 0 || point[0] > 800 || point[1] < 0 || point[1] > 600) {
			collision = true;
		}
	});
	
	var prismpoly = prismToPolygon(prism);	
	stage.activeLevel.objects.forEach((otherprism)=> {
		if (otherprism != prism) {
			if (SAT.testPolygonPolygon(prismpoly, prismToPolygon(otherprism))) {				
				collision = true;
			}
		}
	});
	
	if(collision) {
		prism.position.x = oldx;
		prism.position.y = oldy;
		prism.rotation = oldrot;
	}
	return collision;
}

function prismToPolygon(prism) {
	var points = prism.getPoints();
	return new SAT.Polygon(new SAT.Vector(),
		points.map((point)=> {
			return new SAT.Vector(point[0], point[1]);
		}));
}

window.save = function () {
	console.log(JSON.stringify(stage.activeLevel.toJSON(), null, "\t"));
}

window.edit = function() {
	/*stage.activeLevel.objects.forEach((object)=> {
		object.toggleCheat();
	});*/
	editMode = !editMode;
}
