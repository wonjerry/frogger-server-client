var Gems = require('./Gems');
var Player = require('./Player');
var Enemy = require('./Enemy');
var Popup = require('./Popup');

var FroggerGame = function() {
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
          self.gameState = 2; //game over
        } else {
          self.player.initialize();
          //this.gems.initialize();
        }
      }
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
