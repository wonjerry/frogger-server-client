var inherits = require('inherits');
var FroggerGame = require('./FroggerGameLogic');
var game = null;
var p5Object;

function DrawFroggerGame() {
  if (!(this instanceof DrawFroggerGame)) return new DrawFroggerGame();
}

DrawFroggerGame.prototype.init = function() {
  var self = this;
  self.blueGemImg = p5Object.loadImage('./images/gem-blue.png');
  self.heartImg = p5Object.loadImage('./images/Heart.png');
  self.starImg = p5Object.loadImage('./images/Star.png');
  // map area Images
  self.waterImg = p5Object.loadImage('./images/water-block.png');
  self.stoneImg = p5Object.loadImage('./images/stone-block.png');
  self.grassImg = p5Object.loadImage('./images/grass-block.png');
  self.rowImages = [self.waterImg, self.stoneImg, self.stoneImg, self.stoneImg, self.grassImg, self.grassImg];
  // item Images
  self.greenGemImg = p5Object.loadImage('./images/gem-green.png');
  self.orangeGemImg = p5Object.loadImage('./images/gem-orange.png');
  // enemy and player image
  self.enemyImg = p5Object.loadImage('./images/enemy-bug.png');
  self.playerImg = p5Object.loadImage('./images/char-boy.png');

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