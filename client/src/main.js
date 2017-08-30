var DrawModule = require('./FroggerGameBoard');

function Main(gameInfo) {
  var self = this;
  if (!(self instanceof Main)) return new Main(id);
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
    drawObj.gameSetting(gameInfo);

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
      drawObj.game.handleInput(self.allowedKeys[p.keyCode]);
    };

  };
}

Main.prototype.startGame = function() {
  var self = this;
  new p5(self.p5sketch, 'myp5sketch');
};

module.exports = Main;
