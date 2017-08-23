(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// Enemies our player must avoid
var Enemy = function() {
  var self = this;
  self.width = 70;
  self.height = 50;
  self.initialize();
};
//setSpeed로 player의 레벨을 받아서 speed 값을 조정 해 주어야 한다.
Enemy.prototype.initialize = function(gameState) {
  var self = this;
  if (gameState != 2) { //unless game over
    self.speed = Math.random() * 2 * 100 + 100; //choose initial speed at random
  } else {
    self.speed = 0;
  }
  self.x = -100;
  self.y = (Math.floor(Math.random() * 3) + 1) * 83 - 30; //choose random row
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  var self = this;
  // multiply movement by dt to ensure the game runs at the same speed for all computers
  //if bug has moved off right of screen, move it back to the start and initialize row and speed again
  if (self.x > 550) {
    // 여기 gameState 드가야됨
    self.initialize();
  } else {
    //bugs move at a constant speed and can overtake/overlap
    self.x = self.x + self.speed * dt;
  }
};

Enemy.prototype.getPosition = function() {
  var self = this;
  return {
    x : self.x,
    y : self.y
  };
};

module.exports = Enemy;

},{}],3:[function(require,module,exports){
var inherits = require('inherits');
var FroggerGame = require('./FroggerGameLogic');
var game = null;
var p5Object;

function DrawFroggerGame() {
  if (!(this instanceof DrawFroggerGame)) return new DrawFroggerGame();
}

DrawFroggerGame.prototype.init = function() {
  var self = this;
  self.blueGemImg = p5Object.loadImage('./../public/images/gem-blue.png');
  self.heartImg = p5Object.loadImage('./../public/images/Heart.png');
  self.starImg = p5Object.loadImage('./../public/images/Star.png');
  // map area Images
  self.waterImg = p5Object.loadImage('./../public/images/water-block.png');
  self.stoneImg = p5Object.loadImage('./../public/images/stone-block.png');
  self.grassImg = p5Object.loadImage('./../public/images/grass-block.png');
  self.rowImages = [self.waterImg, self.stoneImg, self.stoneImg, self.stoneImg, self.grassImg, self.grassImg];
  // item Images
  self.greenGemImg = p5Object.loadImage('./../public/images/gem-green.png');
  self.orangeGemImg = p5Object.loadImage('./../public/images/gem-orange.png');
  // enemy and player image
  self.enemyImg = p5Object.loadImage('./../public/images/enemy-bug.png');
  self.playerImg = p5Object.loadImage('./../public/images/char-boy.png');

  self.lastTime = Date.now();
};

DrawFroggerGame.prototype.renderLoop = function() {
  var self = this;
  var now = Date.now(),
    dt = (now - self.lastTime) / 1000.0;

  /* Call our update/render functions, pass along the time delta to
   * our update function since it may be used for smooth animation.
   */
  self.update(dt);
  self.render();

  /* Set our lastTime variable which is used to determine the time delta
   * for the next time this function is called.
   */
  self.lastTime = now;
};

DrawFroggerGame.prototype.renderInfo = function() {
  var self = this;
  //render scores and lives at top of screen
  p5Object.textFont('serif', [30]);
  p5Object.textAlign(p5Object.LEFT);
  p5Object.text("LEVEL: " + game.player.level, 10, 38);
  p5Object.image(self.blueGemImg, 194, 1, 25, 42); // x,y,width,height
  p5Object.text(game.player.score, 224, 38);
  p5Object.image(self.heartImg, 294, 4, 25, 42);
  p5Object.text(game.player.lives, 324, 38);
  if (game.player.invincible === true) {
    p5Object.image(self.starImg, 394, -15, 40, 69);
  }
};

DrawFroggerGame.prototype.update = function(dt) {
  if (game === null) return;
  game.updateAll(dt);
};

DrawFroggerGame.prototype.render = function() {
  var self = this;
  if (game === null) return;
  self.renderMap();
  self.renderInfo();
  self.renderEntities();
};

DrawFroggerGame.prototype.renderMap = function() {
  var self = this;
  /* This array holds the relative URL to the image used
   * for that particular row of the game level.
   */
  var numRows = 6,
    numCols = 5,
    row, col;

  /* Loop through the number of rows and columns we've defined above
   * and, using the rowImages array, draw the correct image for that
   * portion of the "grid"
   */
  for (row = 0; row < numRows; row++) {
    for (col = 0; col < numCols; col++) {
      /* The drawImage function of the canvas' context element
       * requires 3 parameters: the image to draw, the x coordinate
       * to start drawing and the y coordinate to start drawing.
       * We're using our Resources helpers to refer to our images
       * so that we get the benefits of caching these images, since
       * we're using them over and over.
       */
      //ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      p5Object.image(self.rowImages[row], col * 101, row * 83); // x,y,width,height
      //after drawing the board, draw the gems on top according to the current gemGrid
      var gemType = game.gems.gemGrid[row][col];
      switch (gemType) {
        case 0:
          break;
        case 1:
          //ctx.drawImage(Resources.get('./gem-blue.png'), col * 101 + 25, row * 83 + 30, 50, 85);
          p5Object.image(self.blueGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
          break;
        case 2:
          //ctx.drawImage(Resources.get('./gem-green.png'), col * 101 + 25, row * 83 + 30, 50, 85);
          p5Object.image(self.greenGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
          break;
        case 3:
          //ctx.drawImage(Resources.get('./gem-orange.png'), col * 101 + 25, row * 83 + 30, 50, 85);
          p5Object.image(self.orangeGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
          break;
        case 4:
          //ctx.drawImage(Resources.get('./Heart.png'), col * 101 + 25, row * 83 + 40, 50, 85);
          p5Object.image(self.heartImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
          break;
        case 5:
          //ctx.drawImage(Resources.get('./Star.png'), col * 101 + 25, row * 83 + 30, 50, 85);
          p5Object.image(self.starImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
          break;
      }
    }
  }
};

DrawFroggerGame.prototype.renderEntities = function() {
  var self = this;
  /* Loop through all of the objects within the allEnemies array and call
   * the render function you have defined.
   */
   var gameState = game.gameState;
  self.enemyRender();
  self.playerRender(gameState);
  self.popupRender(gameState);
};

DrawFroggerGame.prototype.playerRender = function(gameState){
  var self = this;
  if (gameState == 1) { //player only shows during gameplay
    //ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    var playerPos = game.player.getPosition();
    p5Object.image(self.playerImg, playerPos.x, playerPos.y);
  }
};

DrawFroggerGame.prototype.enemyRender = function(){
  var self = this;
  game.allEnemies.forEach(function(enemy) {
    var enemyPos = enemy.getPosition();
    p5Object.image(self.enemyImg, enemyPos.x, enemyPos.y);
  });
};

DrawFroggerGame.prototype.popupRender = function(gameState){
  //if(gameState === 1) return;
  /*
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 252, 400, 90);
  ctx.fillRect(52, 252, 400, 90);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "24px serif";
  ctx.fillText(this.options[state], 252, 302);
  */
};

var p5sketch = function(p) {
  p5Object = p;
  var drawObject = new DrawFroggerGame();
  p.preload = function() {
    // info area Images on top
    drawObject.init();
  };

  p.setup = function() {
    p.createCanvas(505, 606);
    game = new FroggerGame();
  };

  p.draw = function() {
    p.clear();
    drawObject.renderLoop();
  };

  p.keyPressed = function() {
    var keypress = p.keyCode;
    var gameState = game.gameState;
    if (gameState == 1) { //while playing the game
      switch (keypress) {
        case 37:
          game.player.col -= 1;
          break;
        case 39:
          game.player.col += 1;
          break;
        case 38:
          game.player.row -= 1;
          break;
        case 40:
          game.player.row += 1;
          break;
      }
      // updateAll에서 update시키면 쓸데없이 많은 비교를 하게 된다.
      game.player.update(game.gems);
    } else if (gameState == 0) { //to start the game
      if (keypress === 32) {
        game.gameState = 1;
      }
    } else if (gameState == 2) {
      if (keypress === 82) {
        game = new FroggerGame();
      }
    }
  };

};

new p5(p5sketch, 'myp5sketch');

},{"./FroggerGameLogic":4,"inherits":1}],4:[function(require,module,exports){
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

},{"./Enemy":2,"./Gems":5,"./Player":6,"./Popup":7}],5:[function(require,module,exports){
var Gems = function() {
  var self = this;
  self.gemGrid = [
    [],
    [],
    [],
    [],
    [],
    []
  ]; //gemGrid[row][col]
  self.initialize();
};

//lay gems at random at the start of each level
Gems.prototype.initialize = function() {
  var self = this;
  for (var i = 1; i < 4; i++) { //rows (only the paved ones)
    for (var j = 0; j < 5; j++) { //columns
      //choose whether each square should contain a gem, heart, star, or nothing
      var random = Math.floor(Math.random() * 100);
      switch (true) {
        case (random < 50):
          self.gemGrid[i][j] = 0;
          break;
        case (random < 75):
          self.gemGrid[i][j] = 1;
          break;
        case (random < 90):
          self.gemGrid[i][j] = 2;
          break;
        case (random < 95):
          self.gemGrid[i][j] = 3;
          break;
        case (random < 98):
          self.gemGrid[i][j] = 4;
          break;
        case (random < 100):
          self.gemGrid[i][j] = 5;
          break;
      }
    }
  }
};


module.exports = Gems;

},{}],6:[function(require,module,exports){
//Player the user controls
var Player = function() {
  var self = this;
  self.initialize();
  self.width = 50;
  self.height = 60;
  //player object will hold scores for the game
  self.score = 0;
  self.lives = 3;
  self.level = 1;
};

Player.prototype.initialize = function() {
  var self = this;
  //row and column variables for easier handling
  self.col = 2;
  self.row = 5;
  self.x = self.col * 100;
  self.y = self.row * 83 - 30;
  self.invincible = false;
};
// update시 game 객체 넘겨줄까?
// 아니면 필요한 데이터만 넘겨줄까?
Player.prototype.update = function(gems) {
  var self = this;
  //win the level if you reach the water
  // 이 부분을 row가 4일 때 어떤 플레그를 줘서 그림을 다시 그리게 한다.

  // game 객체에서 필요한 것은 gems 객체뿐이다.
  // gems 객체만 넘겨주자.
  if (self.row === 0) {
    self.level += 1;
    self.initialize();
    gems.initialize();
  }
  //don't go off screen
  else if (self.row > 5) {
    self.row = 5;
  } else if (self.col > 4) {
    self.col = 4;
  } else if (self.col < 0) {
    self.col = 0;
  }
  //collect any gems
  var pickup = gems.gemGrid[self.row][self.col];
  switch (pickup) {
    case 1:
      self.score += 1;
      break;
    case 2:
      self.score += 2;
      break;
    case 3:
      self.score += 10;
      break;
    case 4:
      self.lives += 1;
      break;
    case 5:
      self.invincible = true;
      break;
  }
  //cell is now empty
  gems.gemGrid[self.row][self.col] = 0;
  //update actual position
  self.x = self.col * 100;
  self.y = self.row * 83 - 30;
};

Player.prototype.getPosition = function() {
  var self = this;
  return {
    x : self.x,
    y : self.y
  };
};

module.exports = Player;

},{}],7:[function(require,module,exports){
//start and end screen
var Popup = function() {
  this.options = ["PRESS [SPACE] TO START", "", "GAME OVER"];
  this.content = "";
  //this.state = 0;
};

Popup.prototype.update = function() {
  //choose appropriate text for start or end screen
  //this.state = gameState;
  this.content = this.options[this.state];
};

//draw the popup on screen if gamestate is not-started or game over
Popup.prototype.render = function(state) {
  //if(gameState === 1) return;
  /*
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 252, 400, 90);
  ctx.fillRect(52, 252, 400, 90);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "24px serif";
  ctx.fillText(this.options[state], 252, 302);
  */
};

module.exports = Popup;

},{}]},{},[3]);
