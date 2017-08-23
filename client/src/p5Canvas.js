var DrawModule = require('./FroggerGameBoard');
var allowedKeys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  32: 'space',
  82: 'restart'
};

var p5sketch = function(p) {
  drawObj = new DrawModule();
  p.preload = function() {
    // info area Images on top
    drawObj.init(p);
  };

  p.setup = function() {
    var scale = drawObj.getScale();
    p.createCanvas(scale.w, scale.h);
  };

  p.draw = function() {
    p.clear();
    drawObj.renderLoop();
  };

  p.keyPressed = function() {
    drawObj.game.handleInput(allowedKeys[p.keyCode]);
  };
};
new p5(p5sketch, 'myp5sketch');
