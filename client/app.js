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
  this.sprite = './enemy-bug.png';
  this.width = 70;
  this.height = 50;
  this.initialize();
};

Enemy.prototype.initialize = function() {
  if (gameState != 2) { //unless game over
    this.speed = Math.random() * player.level * 100 + 100; //choose initial speed at random
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
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


//Player the user controls
var Player = function() {
  this.sprite = './char-boy.png';
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
  }else if (gameState == 2) {
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
    gems.initialize();
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
  var pickup = gems.gemGrid[this.row][this.col];
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
  gems.gemGrid[this.row][this.col] = 0;
  //update actual position
  this.x = this.col * 100;
  this.y = this.row * 83 - 30;
};

//draw the player on screen
Player.prototype.render = function() {
  if (this.invincible === true) {
    //player is see-through when invincible
    ctx.globalAlpha = 0.6;
  }
  if (gameState == 1) { //player only shows during gameplay
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
  ctx.globalAlpha = 1;
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
    if(gameState === 1) return;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 252, 400, 90);
    ctx.fillRect(52, 252, 400, 90);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "24px serif";
    ctx.fillText(this.options[state], 252, 302);
};

var FroggerGame = function(){
  this.gems = new Gems();
  this.player = new Player();
  //there are only three bugs on screen at any one time
  this.bug1 = new Enemy();
  this.bug2 = new Enemy();
  this.bug3 = new Enemy();
  this.allEnemies = [this.bug1, this.bug2, this.bug3];
  this.popup = new Popup();
};

FroggerGame.prototype.checkCollisions = function(){
  if (this.player.invincible === false && gameState == 1) {
    for (i = 0; i < this.allEnemies.length; i++) {
      var enemy = allEnemies[i];
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
  p5Object = p;
  drawObject = new DrawFroggerGame();
  p.preload = function() {
    blueGemImg = loadImage('./gem-blue.png');
    heartImg = loadImage('./Heart.png');
    starImg = loadImage('./Star.png');
  };

  p.setup = function() {
    p.createCanvas(505, 606);
  };

  p.draw = function() {
    renderInfo();
  };

  p.keyPressed = function() {
    var str = '';
    
    if (drawObject.game == undefined) return;

    if (drawObject.game.isPause) {
      if (p.keyCode === p.ENTER) {
        str = 'Enter_Key';
      } else if (p.key === 'R') {
        str = 'R_Key';
      } else str = 'none';
    } else {
      if (p.keyCode === p.ENTER) {
        str = 'Enter_Key';
      } else if (p.key === 'R') {
        str = 'R_Key';
      } else if (p.key === 'A') {
        str = 'A_Key';
      } else if (p.key === 'S') {
        str = 'S_Key';
      } else if (p.keyCode === global.KEY_SPACE) { /*space bar*/
        str = 'Space_Key';
      } else if (p.keyCode === global.KEY_SHIFT) { /*shift*/
        // hold 할 수 없으면 전송하지 않는다.
        if (drawObject.game.holdable) {
          str = 'Shift_Key';
        }
      } else if (p.keyCode === p.LEFT_ARROW) {
        str = 'Left_Key';
      } else if (p.keyCode === p.RIGHT_ARROW) {
        str = 'Right_Key';
      } else if (p.keyCode === p.DOWN_ARROW) {
        str = 'Down_Key';
      } else if (p.keyCode === p.UP_ARROW) {
        str = 'Up_Key';
      } else str = 'none';
    }

    if (str !== 'none') drawObject.emit('Key_Pressed', {
      data: str
    });
    p.redraw();
  };
};

new p5(p5sketch, 'myp5sketch');

function DrawFroggerGame(){}

DrawFroggerGame.prototype.renderInfo = function(){
  //render scores and lives at top of screen
  //ctx.font = "30px serif";
  p5Object.textFont('serif',[30]);
  //ctx.fillStyle = "black";
  //ctx.textAlign = "left";
  p5Object.textAlign(LEFT);
  //ctx.clearRect(10, 50, 500, -50);
  p5Object.text("LEVEL: " + player.level, 10, 38);
  //ctx.fillText("LEVEL: " + player.level, 10, 38);
  //ctx.drawImage(Resources.get('./gem-blue.png'), 194, 1, 25, 42);
  p5Object.image(blueGem, 194, 1, 25, 42); // x,y,width,height
  //ctx.fillText(player.score, 224, 38);
  p5Object.text(player.score, 224, 38);
  //ctx.drawImage(Resources.get('./Heart.png'), 294, 4, 25, 42);
  p5Object.image(heartImg, 294, 4, 25, 42);
  //ctx.fillText(player.lives, 324, 38);
  p5Object.text(player.lives, 324, 38);
  //show a star if player is in invincibility mode
  if (player.invincible === true) {
    //ctx.drawImage(Resources.get('./Star.png'), 394, -15, 40, 69);
    p5Object.image(starImg, 394, -15, 40, 69);
  }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space',
    82: 'R'
  };
  player.handleInput(allowedKeys[e.keyCode]);
});
