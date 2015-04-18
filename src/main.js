var PIXI = require('pixi');
var Prism = require('./prism');
var Line = require('./line');
var Ray = require('./ray');
var BendRay = require('./bendray');
var kd = require('keydrown');

var renderer = new PIXI.CanvasRenderer(800, 600);

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;

var bunnyTexture = PIXI.Texture.fromImage("bunny.png");
var bunny = new PIXI.Sprite(bunnyTexture);

bunny.position.x = 100;
bunny.position.y = 300;

bunny.scale.x = 2;
bunny.scale.y = 2;

var prism = new Prism();
prism.position.x = 150;
prism.position.y = 200;

var redRay = new BendRay([0, 0], [1, 1], prism, 0xFF0000, 1);
var orangeRay = new BendRay([0, 0], [1, 1], prism, 0xFFA500, 0.975);
var yellowRay = new BendRay([0, 0], [1, 1], prism, 0xFFFF00, 0.95);
var greenRay = new BendRay([0, 0], [1, 1], prism, 0x00FF00, 0.925);
var blueRay = new BendRay([0, 0], [1, 1], prism, 0x0000FF, 0.9);
stage.addChild(prism);
stage.addChild(redRay);
stage.addChild(orangeRay);
stage.addChild(yellowRay);
stage.addChild(greenRay);
stage.addChild(blueRay);

requestAnimationFrame(animate);

kd.A.down(() => {
	prism.rotation -= 0.01;
});

kd.D.down(() => {
	prism.rotation += 0.01;
});

function animate() {
	kd.tick();
	//prism.rotation += 0.01;
	var mouse = stage.getMousePosition();
	redRay.origin = [mouse.x, mouse.y];
	orangeRay.origin = [mouse.x, mouse.y];
	yellowRay.origin = [mouse.x, mouse.y];
	greenRay.origin = [mouse.x, mouse.y];
	blueRay.origin = [mouse.x, mouse.y];
	//console.log(stage.getMousePosition());
	redRay.update();
	orangeRay.update();
	yellowRay.update();
	greenRay.update();
	blueRay.update();

	renderer.render(stage);

	requestAnimationFrame(animate);
}
