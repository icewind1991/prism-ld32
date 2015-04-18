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
prism.position.x = 100;
prism.position.y = 150;

var ray1 = new BendRay([0, 0], [1, 1], prism);
var ray2 = new BendRay([0, 0], [1, 1], prism);
ray2.color = 0x0000FF;
ray2.refractionScale = 0.9;
stage.addChild(prism);
stage.addChild(ray1);
stage.addChild(ray2);

requestAnimationFrame(animate);

kd.LEFT.down(() => {
	prism.rotation -= 0.01;
});

kd.RIGHT.down(() => {
	prism.rotation += 0.01;
});

function animate() {
	kd.tick();
	//prism.rotation += 0.01;
	var mouse = stage.getMousePosition();
	ray1.origin = [mouse.x, mouse.y];
	ray2.origin = [mouse.x, mouse.y];
	//console.log(stage.getMousePosition());
	ray1.update();
	ray2.update();

	renderer.render(stage);

	requestAnimationFrame(animate);
}
