var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Ray = require('./ray');
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

stage.addChild(prism1);
stage.addChild(prism2);
var prisms = [prism1, prism2];
var rays = [];
var origin = [0, 0];
var dir = [1, 1];
rays.push(new BendRay(origin, dir, prisms, 0xFF0000, 0.9));//720nm
rays.push(new BendRay(origin, dir, prisms, 0xFF9B00, 0.925));//610nm
rays.push(new BendRay(origin, dir, prisms, 0xFFFF00, 0.95));//580nm
rays.push(new BendRay(origin, dir, prisms, 0x00FF00, 0.975));//510nm
rays.push(new BendRay(origin, dir, prisms, 0x0000FF, 1));//440nm
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

kd.A.down(() => {
	prism1.position.x -= 1;
	keypressed = true;
});

kd.S.down(() => {
	prism1.position.y += 1;
	keypressed = true;
});

kd.D.down(() => {
	prism1.position.x += 1;
	keypressed = true;
});

kd.W.down(() => {
	prism1.position.y -= 1;
	keypressed = true;
});

kd.Q.down(() => {
	prism1.rotation -= 0.01;
	keypressed = true;
});

kd.E.down(() => {
	prism1.rotation += 0.01;
	keypressed = true;
});

kd.R.down(() => {
	prism1.refractionIndex += 0.01;
	if (prism1.refractionIndex > 2.5) {
		prism1.refractionIndex = 2.5;
	}
	keypressed = true;
});

kd.T.down(() => {
	prism1.refractionIndex -= 0.01;
	if (prism1.refractionIndex < 1) {
		prism1.refractionIndex = 1;
	}
	keypressed = true;
});

var dragging = null;
stage.mousedown = function() {
	if(dragging == null) {
		prisms.forEach((prism)=> {
			console.log(stage.getMousePosition().x + " " + stage.getMousePosition().y);
			if(SAT.pointInPolygon(new SAT.Vector(stage.getMousePosition().x, stage.getMousePosition().y), 
								new SAT.Polygon(new SAT.Vector(),
												[new SAT.Vector(prism.position.x+0,prism.position.y-50), 
												new SAT.Vector(prism.position.x-50,prism.position.y+50), 
												new SAT.Vector(prism.position.x+50,prism.position.y+50)]))) {
				dragging = prism;
				console.log("clicked in prism");
			} else {
				console.log("clicked outside");
			}
		});
	}
}

stage.mouseup = function() {
	dragging = null;
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
		if(dragging != null) {
			dragging.position.x = newMouse.x;
			dragging.position.y = newMouse.y;
		}
		rays.forEach((ray)=> {
			ray.update();
		});
		oldMouse.x = newMouse.x;
		oldMouse.y = newMouse.y;
		keypressed = false;
	}

	enemies.forEach((enemy)=> {
		rays.forEach((ray)=> {
			if (ray.hitPrism) {
				var cone = ray.currentCone;
				if (intersects(cone, enemy.bounds)) {
					enemy.hit(ray.color);
					enemy.init();//update
				}
			}
		});
	});

	renderer.render(stage);

	requestAnimationFrame(animate);
}

function intersects(cone, enemyBounds) {
	var conePol = new SAT.Polygon(new SAT.Vector(), [
		new SAT.Vector(cone[0], cone[1]),
		new SAT.Vector(cone[4], cone[5]),
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

