var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Ray = require('./ray');
var Enemy = require('./enemy');
var BendRay = require('./bendray');
var kd = require('keydrown');

var renderer = new PIXI.CanvasRenderer(800, 600);

//var renderer = new PIXI.autoDetectRenderer(800, 600);

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;
console.log(PIXI.blendModes);

var prism = new Prism();
prism.position.x = 150;
prism.position.y = 200;

stage.addChild(prism);
var rays = [];
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFF0000, 1));//720nm
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFF9B00, 0.975));//610nm
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFFFF00, 0.95));//580nm
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0x00FF00, 0.925));//510nm
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0x0000FF, 0.9));//440nm
rays.forEach((ray)=>{
	stage.addChild(ray);
});

var enemies = [];
enemies.push(new Enemy(0xFF0000));
enemies.forEach((enemy)=>{
		stage.addChild(enemy);
});

requestAnimationFrame(animate);

var keypressed = false;

kd.A.down(() => {
	prism.position.x -= 1;
	keypressed = true;
});

kd.S.down(() => {
	prism.position.y += 1;
	keypressed = true;
});

kd.D.down(() => {
	prism.position.x += 1;
	keypressed = true;
});

kd.W.down(() => {
	prism.position.y -= 1;
	keypressed = true;
});

kd.Q.down(() => {
	prism.rotation -= 0.01;
	keypressed = true;
});

kd.E.down(() => {
	prism.rotation += 0.01;
	keypressed = true;
});

kd.R.down(() => {
	prism.refractionIndex += 0.01;
	if(prism.refractionIndex > 2.5) {
		prism.refractionIndex = 2.5;
	}	
	keypressed = true;
});

kd.T.down(() => {
	prism.refractionIndex -= 0.01;
	if(prism.refractionIndex < 1) {
		prism.refractionIndex = 1;
	}	
	keypressed = true;
});

var oldMouse = [];

function animate() {
	kd.tick();
	//prism.rotation += 0.01;
	var newMouse = stage.getMousePosition();
	if(keypressed || newMouse.x != oldMouse.x || newMouse.x != oldMouse.x) {
		rays.forEach((ray)=>{
			ray.destination = [newMouse.x, newMouse.y];
		});
		//console.log(stage.getMousePosition());
		rays.forEach((ray)=>{
			ray.update();
		});				
		oldMouse.x = newMouse.x;
		oldMouse.y = newMouse.y;
		keypressed = false;
	}
	
	renderer.render(stage);
	
	requestAnimationFrame(animate);
}
