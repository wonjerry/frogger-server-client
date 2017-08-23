var Gems = require('./Gems');
var Player = require('./Player');
var Enemy = require('./Enemy');
var Popup = require('./Popup');

var FroggerGame = function() {
  var self = this;
  self.init();
};

FroggerGame.prototype.init = function() {
  var self = this;
  self.gameState = 0; //0=not started, 1=playing, 2=game over

  self.gems = new Gems();
  self.player = new Player();
  //there are only three bugs on screen at any one time
  self.bug1 = new Enemy(self.gameState);
  self.bug2 = new Enemy(self.gameState);
  self.bug3 = new Enemy(self.gameState);
  self.allEnemies = [self.bug1, self.bug2, self.bug3];
  self.popup = new Popup();
};

FroggerGame.prototype.checkCollisions = function() {
  var self = this;
  if (self.player.invincible === false && self.gameState == 1) {
    for (i = 0; i < self.allEnemies.length; i++) {
      var enemy = self.allEnemies[i];
      // bounding box collision detection
      if (self.player.x < enemy.x + enemy.width && self.player.x + enemy.width > enemy.x &&
        self.player.y < enemy.y + enemy.height && self.player.y + self.player.height > enemy.y) {
        self.player.lives -= 1;
        if (self.player.lives === 0) {
          self.gameState = 2;
          return;
        } else {
          self.player.initialize();
          return;
        }
      }
    }
  }
};

FroggerGame.prototype.handleInput = function(key) {
  var self = this;
  if (self.gameState == 1) { //while playing the game
    switch (key) {
      case 'left':
        self.player.col -= 1;
        break;
      case 'right':
        self.player.col += 1;
        break;
      case 'up':
        self.player.row -= 1;
        break;
      case 'down':
        self.player.row += 1;
        break;
      case 'restart':
        self.init();
        break;
    }
    // updateAll에서 update시키면 쓸데없이 많은 비교를 하게 된다.
    self.player.update(self.gems);
  } else if (self.gameState == 0) { //to start the game
    if (key === 'space') {
      self.gameState = 1;
    }
  } else if (self.gameState == 2) {
    if (key === 'restart') {
      self.init();
    }
  }
};

FroggerGame.prototype.updateAll = function(dt) {
  var self = this;
  self.allEnemies.forEach(function(enemy) {
    enemy.update(dt);
  });

  self.checkCollisions();
};

module.exports = FroggerGame;
