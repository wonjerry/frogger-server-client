var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var p5Object, drawObject;

inherits(DrawFroggerGame, EventEmitter);

function DrawFroggerGame() {
  if (!(this instanceof DrawFroggerGame)) return new DrawFroggerGame();
}

DrawFroggerGame.prototype.init = function() {
  this.blueGemImg = p5Object.loadImage('./images/gem-blue.png');
  this.heartImg = p5Object.loadImage('./images/Heart.png');
  this.starImg = p5Object.loadImage('./images/Star.png');
  // map area Images
  this.waterImg = p5Object.loadImage('./images/water-block.png');
  this.stoneImg = p5Object.loadImage('./images/stone-block.png');
  this.grassImg = p5Object.loadImage('./images/grass-block.png');
  this.rowImages = [waterImg, stoneImg, stoneImg, stoneImg, grassImg, grassImg];
  // item Images
  this.greenGemImg = p5Object.loadImage('./images/gem-green.png');
  this.orangeGemImg = p5Object.loadImage('./images/gem-orange.png');
  // enemy and player image
  this.enemyImg = p5Object.loadImage('./images/enemy-bug.png');
  this.playerImg = p5Object.loadImage('./images/char-boy.png');
};

DrawFroggerGame.prototype.gameLoop = function() {

};

var p5sketch = function(p) {
  var self = this;
  p5Object = p;
  drawObject = new DrawFroggerGame();
  p.preload = function() {
    // info area Images on top
    drawObject.init();
  };

  p.setup = function() {
    p.createCanvas(505, 606);
    self.lastTime = Date.now();
  };

  p.draw = function() {
    p.clear();
    var now = Date.now(),
      dt = (now - self.lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    update(dt);
    render();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
    self.lastTime = now;
  };

  p.keyPressed = function() {
    var keypress = p.keyCode;
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
      game.player.update();
    } else if (gameState == 0) { //to start the game
      if (keypress === 32) {
        gameState = 1;
      }
    } else if (gameState == 2) {
      if (keypress === 82) {
        game = new FroggerGame();
      }
    }
  };

  function renderInfo() {
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
  }

  function update(dt) {
    updateEntities(dt);
    game.checkCollisions();
  }

  function updateEntities(dt) {
    game.allEnemies.forEach(function(enemy) {
      enemy.update(dt);
    });
  }

  function render() {
    renderMap();
    renderInfo();
    renderEntities();
  }

  function renderMap() {
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
        p5Object.image(rowImages[row], col * 101, row * 83); // x,y,width,height
        //after drawing the board, draw the gems on top according to the current gemGrid
        var gemType = game.gems.gemGrid[row][col];
        switch (gemType) {
          case 0:
            break;
          case 1:
            //ctx.drawImage(Resources.get('./gem-blue.png'), col * 101 + 25, row * 83 + 30, 50, 85);
            p5Object.image(blueGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
            break;
          case 2:
            //ctx.drawImage(Resources.get('./gem-green.png'), col * 101 + 25, row * 83 + 30, 50, 85);
            p5Object.image(greenGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
            break;
          case 3:
            //ctx.drawImage(Resources.get('./gem-orange.png'), col * 101 + 25, row * 83 + 30, 50, 85);
            p5Object.image(orangeGemImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
            break;
          case 4:
            //ctx.drawImage(Resources.get('./Heart.png'), col * 101 + 25, row * 83 + 40, 50, 85);
            p5Object.image(heartImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
            break;
          case 5:
            //ctx.drawImage(Resources.get('./Star.png'), col * 101 + 25, row * 83 + 30, 50, 85);
            p5Object.image(starImg, col * 101 + 25, row * 83 + 30, 50, 85); // x,y,width,height
            break;
        }
      }
    }
  }

  function renderEntities() {
    /* Loop through all of the objects within the allEnemies array and call
     * the render function you have defined.
     */
    game.allEnemies.forEach(function(enemy) {
      enemy.render();
    });

    game.player.render();
    game.popup.render(gameState);
  }
};

new p5(p5sketch, 'myp5sketch');
