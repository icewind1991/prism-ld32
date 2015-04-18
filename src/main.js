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

var prism1 = new Prism();
prism1.position.x = 150;
prism1.position.y = 200;

var prism2 = new Prism();
prism2.position.x = 550;
prism2.position.y = 500;

stage.addChild(prism1);
stage.addChild(prism2);
var rays = [];
rays.push(new BendRay([0, renderer.view.height / 4], [1, 1], [prism1, prism2], 0xFF0000, 1));//720nm
rays.push(new BendRay([0, renderer.view.height / 4], [1, 1], [prism1, prism2], 0xFF9B00, 0.975));//610nm
rays.push(new BendRay([0, renderer.view.height / 4], [1, 1], [prism1, prism2], 0xFFFF00, 0.95));//580nm
rays.push(new BendRay([0, renderer.view.height / 4], [1, 1], [prism1, prism2], 0x00FF00, 0.925));//510nm
rays.push(new BendRay([0, renderer.view.height / 4], [1, 1], [prism1, prism2], 0x0000FF, 0.9));//440nm
rays.forEach((ray)=> {
	stage.addChild(ray);
});
requestAnimationFrame(animate);

kd.A.down(() => {
	prism1.position.x -= 1;
});

kd.S.down(() => {
	prism1.position.y += 1;
});

kd.D.down(() => {
	prism1.position.x += 1;
});

kd.W.down(() => {
	prism1.position.y -= 1;
});

kd.Q.down(() => {
	prism1.rotation -= 0.01;
});

kd.E.down(() => {
	prism1.rotation += 0.01;
});

kd.R.down(() => {
	prism1.refractionIndex += 0.01;
	if (prism1.refractionIndex > 2.5) {
		prism1.refractionIndex = 2.5;
	}
});

kd.T.down(() => {
	prism1.refractionIndex -= 0.01;
	if (prism1.refractionIndex < 1) {
		prism1.refractionIndex = 1;
	}
});

function animate() {
	kd.tick();
	//prism1.rotation += 0.01;
	var mouse = stage.getMousePosition();
	rays.forEach((ray)=> {
		ray.destination = [mouse.x, mouse.y];
	});
	//console.log(stage.getMousePosition());
	rays.forEach((ray)=> {
		ray.update();
	});
	renderer.render(stage);

	requestAnimationFrame(animate);
}
