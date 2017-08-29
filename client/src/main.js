var DrawModule = require('./FroggerGameBoard');

function Main(id) {
  var self = this;
  if (!(self instanceof Main)) return new Main(id);
  self.id = id || 'offline';
  self.allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space',
    82: 'restart'
  };

  self.p5sketch = function(p) {
    drawObj = new DrawModule();
    p.preload = function() {
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
      drawObj.game.handleInput(self.id,allowedKeys[p.keyCode]);
    };

  };
}

Main.prototype.startGame = function() {
  new p5(self.p5sketch, 'myp5sketch');
};

module.exports = Main;
