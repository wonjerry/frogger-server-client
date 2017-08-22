var gameState = 0; //0=not started, 1=playing, 2=game over

//set of gems on the screen, including hearts (lives) and stars (invincibility)
var Gems = function() {
  this.gemGrid = [
    [],
    [],
    [],
    [],
    [],
    []
  ]; //gemGrid[row][col]
  this.initialize();
};

//lay gems at random at the start of each level
Gems.prototype.initialize = function() {
  for (var i = 1; i < 4; i++) { //rows (only the paved ones)
    for (var j = 0; j < 5; j++) { //columns
      //choose whether each square should contain a gem, heart, star, or nothing
      var random = Math.floor(Math.random() * 100);
      switch (true) {
        case (random < 50):
          this.gemGrid[i][j] = 0;
          break;
        case (random < 75):
          this.gemGrid[i][j] = 1;
          break;
        case (random < 90):
          this.gemGrid[i][j] = 2;
          break;
        case (random < 95):
          this.gemGrid[i][j] = 3;
          break;
        case (random < 98):
          this.gemGrid[i][j] = 4;
          break;
        case (random < 100):
          this.gemGrid[i][j] = 5;
          break;
      }
    }
  }
};



// Enemies our player must avoid
var Enemy = function() {
  this.width = 70;
  this.height = 50;
  this.initialize();
};
//setSpeed로 player의 레벨을 받아서 speed 값을 조정 해 주어야 한다.
Enemy.prototype.initialize = function() {
  if (gameState != 2) { //unless game over
    //this.speed = Math.random() * game.player.level * 100 + 100; //choose initial speed at random
    this.speed = Math.random() * 2 * 100 + 100; //choose initial speed at random
  } else {
    this.speed = 0;
  }
  this.x = -100;
  this.y = (Math.floor(Math.random() * 3) + 1) * 83 - 30; //choose random row
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // multiply movement by dt to ensure the game runs at the same speed for all computers
  //if bug has moved off right of screen, move it back to the start and initialize row and speed again
  if (this.x > 550) {
    this.initialize();
  } else {
    //bugs move at a constant speed and can overtake/overlap
    this.x = this.x + this.speed * dt;
  }
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
  //ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  p5Object.image(enemyImg, this.x, this.y);
};


//Player the user controls
var Player = function() {
  this.initialize();
  this.width = 50;
  this.height = 60;
  //player object will hold scores for the game
  this.score = 0;
  this.lives = 3;
  this.level = 1;
};

Player.prototype.initialize = function() {
  //row and column variables for easier handling
  this.col = 2;
  this.row = 5;
  this.x = this.col * 100;
  this.y = this.row * 83 - 30;
  this.invincible = false;
};

Player.prototype.handleInput = function(keypress) {
  if (gameState == 1) { //while playing the game
    switch (keypress) {
      case 'left':
        this.col -= 1;
        break;
      case 'right':
        this.col += 1;
        break;
      case 'up':
        this.row -= 1;
        break;
      case 'down':
        this.row += 1;
        break;
    }
    this.update();
  } else if (gameState == 0) { //to start the game
    popup.render(gameState);
    if (keypress === "space") {
      gameState = 1;
    }
  } else if (gameState == 2) {
    if (keypress === "R") {
      gameState = 0;
      gems = new Gems();
      player = new Player();
      //there are only three bugs on screen at any one time
      bug1 = new Enemy();
      bug2 = new Enemy();
      bug3 = new Enemy();
    }
  }
};

Player.prototype.update = function() {
  //win the level if you reach the water
  // 이 부분을 row가 4일 때 어떤 플레그를 줘서 그림을 다시 그리게 한다.
  if (this.row === 0) {
    this.level += 1;
    this.initialize();
    game.gems.initialize();
  }
  //don't go off screen
  else if (this.row > 5) {
    this.row = 5;
  } else if (this.col > 4) {
    this.col = 4;
  } else if (this.col < 0) {
    this.col = 0;
  }
  //collect any gems
  var pickup = game.gems.gemGrid[this.row][this.col];
  switch (pickup) {
    case 1:
      this.score += 1;
      break;
    case 2:
      this.score += 2;
      break;
    case 3:
      this.score += 10;
      break;
    case 4:
      this.lives += 1;
      break;
    case 5:
      this.invincible = true;
      break;
  }
  //cell is now empty
  game.gems.gemGrid[this.row][this.col] = 0;
  //update actual position
  this.x = this.col * 100;
  this.y = this.row * 83 - 30;
};

//draw the player on screen
Player.prototype.render = function() {
  //if (this.invincible === true) {
  //player is see-through when invincible
  //  ctx.globalAlpha = 0.6;
  //}
  if (gameState == 1) { //player only shows during gameplay
    //ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    p5Object.image(playerImg, this.x, this.y);
  }
  //ctx.globalAlpha = 1;
};

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

var FroggerGame = function() {
  this.gems = new Gems();
  this.player = new Player();
  //there are only three bugs on screen at any one time
  this.bug1 = new Enemy();
  this.bug2 = new Enemy();
  this.bug3 = new Enemy();
  this.allEnemies = [this.bug1, this.bug2, this.bug3];
  this.popup = new Popup();
};

FroggerGame.prototype.checkCollisions = function() {
  if (this.player.invincible === false && gameState == 1) {
    for (i = 0; i < this.allEnemies.length; i++) {
      var enemy = this.allEnemies[i];
      // bounding box collision detection
      if (this.player.x < enemy.x + enemy.width && this.player.x + enemy.width > enemy.x &&
        this.player.y < enemy.y + enemy.height && this.player.y + this.player.height > enemy.y) {
        this.player.lives -= 1;
        if (this.player.lives === 0) {
          gameState = 2; //game over
        } else {
          this.player.initialize();
          this.gems.initialize();
        }
      }
    }
  }
};

game = new FroggerGame();

var p5sketch = function(p) {
  var self = this;
  p5Object = p;
  //drawObject = new DrawFroggerGame();
  p.preload = function() {
    // info area Images on top
    self.blueGemImg = p.loadImage('./images/gem-blue.png');
    self.heartImg = p.loadImage('./images/Heart.png');
    self.starImg = p.loadImage('./images/Star.png');
    // map area Images
    self.waterImg = p.loadImage('./images/water-block.png');
    self.stoneImg = p.loadImage('./images/stone-block.png');
    self.grassImg = p.loadImage('./images/grass-block.png');
    self.rowImages = [waterImg, stoneImg, stoneImg, stoneImg, grassImg, grassImg]; // 뭔가 레퍼런스 문제가 있을 수 있다.
    // item Images
    self.greenGemImg = p.loadImage('./images/gem-green.png');
    self.orangeGemImg = p.loadImage('./images/gem-orange.png');
    // enemy and player image
    self.enemyImg = p.loadImage('./images/enemy-bug.png');
    self.playerImg = p.loadImage('./images/char-boy.png');
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
