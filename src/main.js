var PIXI = require('pixi.js');
var Prism = require('./prism');
var Line = require('./line');
var Ray = require('./ray');
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
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFF0000, 1));
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFFA500, 0.975));
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0xFFFF00, 0.95));
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0x00FF00, 0.925));
rays.push(new BendRay([0, renderer.view.height/4], [1, 1], prism, 0x0000FF, 0.9));
rays.forEach((ray)=>{
	stage.addChild(ray);
});
requestAnimationFrame(animate);

kd.A.down(() => {
	prism.position.x -= 1;
});

kd.S.down(() => {
	prism.position.y += 1;
});

kd.D.down(() => {
	prism.position.x += 1;
});

kd.W.down(() => {
	prism.position.y -= 1;
});

kd.Q.down(() => {
	prism.rotation -= 0.01;
});

kd.E.down(() => {
	prism.rotation += 0.01;
});

kd.R.down(() => {
	prism.refractionIndex += 0.01;
	if(prism.refractionIndex > 5) {
		prism.refractionIndex = 5;
	}	
});

kd.T.down(() => {
	prism.refractionIndex -= 0.01;
	if(prism.refractionIndex < 1) {
		prism.refractionIndex = 1;
	}	
});

function animate() {
	kd.tick();
	//prism.rotation += 0.01;
	var mouse = stage.getMousePosition();
	rays.forEach((ray)=>{
		ray.destination = [mouse.x, mouse.y];
	});
	//console.log(stage.getMousePosition());
	rays.forEach((ray)=>{
		ray.update();
	});	
	renderer.render(stage);

	requestAnimationFrame(animate);
}
