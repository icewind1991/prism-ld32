var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Ray = require('./ray');
var Barier = require('./barier');
var Mirror = require('./mirror');
var Enemy = require('./enemy');
var BendRay = require('./bendray');
var kd = require('keydrown');
var SAT = require('sat');

var renderer = new PIXI.CanvasRenderer(800, 600);

//var renderer = new PIXI.autoDetectRenderer(800, 600);

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;

var prism1 = new Prism();
prism1.position.x = 150;
prism1.position.y = 200;

var prism2 = new Prism();
prism2.position.x = 550;
prism2.position.y = 500;

var prism3 = new Prism();
prism3.position.x = 550;
prism3.position.y = 200;

var prism4 = new Prism();
prism4.position.x = 550;
prism4.position.y = 100;

var barier = new Barier(20, 200, 0xFF88FF);
barier.position.x = 250;
barier.position.y = 200;

var mirror = new Mirror(20, 200, 0xFFFFFF);
mirror.position.x = 100;
mirror.position.y = 300;

stage.addChild(prism1);
stage.addChild(prism2);
stage.addChild(prism3);
stage.addChild(prism4);
stage.addChild(barier);
stage.addChild(mirror);
var prisms = [prism1, prism2, barier, prism3, prism4, mirror];
var rays = [];
var origin = [0, 0];
var dir = [1, 1];
rays.push(new BendRay(origin, dir, prisms, 0xFF0000));//720nm
rays.push(new BendRay(origin, dir, prisms, 0x00FFFF));//610nm
rays.push(new BendRay(origin, dir, prisms, 0xFFFF00));//580nm
rays.push(new BendRay(origin, dir, prisms, 0x00FF00));//510nm
rays.push(new BendRay(origin, dir, prisms, 0x0000FF));//440nm
rays.forEach((ray)=> {
	stage.addChild(ray);
});

var enemies = [];
enemies.push(new Enemy(0xFFFF00));
enemies.forEach((enemy)=> {
	stage.addChild(enemy);
});

requestAnimationFrame(animate);

var keypressed = false;

kd.R.down(() => {
	if(dragging != null) {
		dragging.refractionIndex += 0.01;
		if (dragging.refractionIndex > 2.5) {
			dragging.refractionIndex = 2.5;
		}
		keypressed = true;
	}
});


kd.T.down(() => {
	if(dragging != null) {
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
		prisms.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(stage.getMousePosition().x, stage.getMousePosition().y),
					prismToPolygon(prism))) {
				dragging = prism;
				offset = [stage.getMousePosition().x - prism.position.x, stage.getMousePosition().y - prism.position.y];
			}
		});
	}
}

stage.mouseup = function () {
	dragging = null;
	offset = [0, 0];
}

document.addEventListener("mousewheel", mouseWheelHandler, false);

function mouseWheelHandler(e) {
	if(hovering != null) {
		if(e.wheelDelta < 0) {
			if(!hasCollisions(hovering, hovering.position.x, hovering.position.y, hovering.rotation - 0.01)) {
				hovering.rotation -= 0.01;
				keypressed = true;
			}
		} else {
			if(!hasCollisions(hovering, hovering.position.x, hovering.position.y, hovering.rotation + 0.01)) {
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
		if (dragging != null){
			var dragx = newMouse.x - offset[0];
			var dragy = newMouse.y - offset[1];
			if(hasCollisions(dragging, dragx, dragy, dragging.rotation)) {
				//TODO offset
			} else {
				dragging.position.x = dragx;
				dragging.position.y = dragy;
			}
		}
		rays.forEach((ray)=> {
			ray.update();
		});
		oldMouse.x = newMouse.x;
		oldMouse.y = newMouse.y;
		keypressed = false;
	}

	enemies.forEach((enemy)=> {
		var enemyhit = false;
		rays.forEach((ray)=> {
			if (ray.hitPrism) {
				var cone = ray.currentCone;
				if (intersects(cone, enemy.bounds)) {
					enemy.hit(ray.color);
					enemyhit = true;
					enemy.init();//update
				} 
			}
		});
		if(!enemyhit) {
			enemy.regen();
			enemy.init();//update
		}
	});
	
	if(dragging == null) { //only check for hover updates when not dragging
		var nowhovering = false;
		prisms.forEach((prism)=> {
			if (SAT.pointInPolygon(new SAT.Vector(stage.getMousePosition().x, stage.getMousePosition().y),
					prismToPolygon(prism))) {
				nowhovering = true;
				hovering = prism;
			}
		});		
		if(!nowhovering) {
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
	prisms.forEach((otherprism)=> {
		if(otherprism != prism) {
			if(SAT.testPolygonPolygon(prismpoly, prismToPolygon(otherprism))) {
				prism.position.x = oldx;
				prism.position.y = oldy;
				prism.rotation = oldrot;
				collision = true;
			}
		}
	});
	return collision;
}

function intersects(cone, enemyBounds) {
	var conePol = new SAT.Polygon(new SAT.Vector(), [
		new SAT.Vector(cone[0], cone[1]),
		new SAT.Vector(cone[2], cone[3]),
		new SAT.Vector(cone[2], cone[3])
	]);

	var boxPol = new SAT.Polygon(new SAT.Vector(), [
		new SAT.Vector(enemyBounds[0], enemyBounds[1]),
		new SAT.Vector(enemyBounds[0], enemyBounds[3]),
		new SAT.Vector(enemyBounds[2], enemyBounds[3]),
		new SAT.Vector(enemyBounds[2], enemyBounds[1])
	]);

	return SAT.testPolygonPolygon(conePol, boxPol);
}

function prismToPolygon(prism) {
	var points = prism.getPoints();
	return new SAT.Polygon(new SAT.Vector(),
		points.map((point)=> {
			return new SAT.Vector(point[0], point[1]);
		}));
}

