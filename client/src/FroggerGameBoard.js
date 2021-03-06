var FroggerGame = require('./FroggerGameLogic')
var p5Object
var _dir = './../images/'

function DrawFroggerGame () {
  if (!(this instanceof DrawFroggerGame)) return new DrawFroggerGame()
}

DrawFroggerGame.prototype.init = function (p) {
  var self = this
  p5Object = p
  self.width = 505
  self.height = 606

  self.heartImg = p5Object.loadImage(_dir + 'Heart.png')
  self.starImg = p5Object.loadImage(_dir + 'Star.png')
  // map area Images
  self.waterImg = p5Object.loadImage(_dir + 'water-block.png')
  self.stoneImg = p5Object.loadImage(_dir + 'stone-block.png')
  self.grassImg = p5Object.loadImage(_dir + 'grass-block.png')
  self.rowImages = [self.waterImg, self.stoneImg, self.stoneImg, self.stoneImg, self.grassImg, self.grassImg]
  // item Images
  self.blueGemImg = p5Object.loadImage(_dir + 'gem-blue.png')
  self.greenGemImg = p5Object.loadImage(_dir + 'gem-green.png')
  self.orangeGemImg = p5Object.loadImage(_dir + 'gem-orange.png')
  // enemy and player image
  self.enemyImg = p5Object.loadImage(_dir + 'enemy-bug.png')
  self.playerImg = p5Object.loadImage(_dir + 'char-boy.png')
  self.player2Img = p5Object.loadImage(_dir + 'char-cat-girl.png')

}

DrawFroggerGame.prototype.getScale = function () {
  var self = this
  return {
    w: self.width,
    h: self.height
  }
}

DrawFroggerGame.prototype.render = function (players, level, allEnemies, gameState, gems) {
  var self = this

  self.renderMap(gems)
  self.renderInfo(players[0], level)
  self.renderEntities(players, allEnemies, gameState)
}

DrawFroggerGame.prototype.renderEntities = function (players, allEnemies, gameState) {
  var self = this
  /* Loop through all of the objects within the allEnemies array and call
   * the render function you have defined.
   */
  self.enemyRender(allEnemies)
  self.playerRender(players, gameState)
  self.popupRender(gameState)
}

DrawFroggerGame.prototype.renderInfo = function (player, level) {
  var self = this
  //render scores and lives at top of screen
  p5Object.textFont('serif', [30])
  p5Object.textAlign(p5Object.LEFT)
  p5Object.text('LEVEL: ' + level, 10, 38)
  p5Object.image(self.blueGemImg, 194, 1, 25, 42) // x,y,width,height
  p5Object.text(player.score, 224, 38)
  p5Object.image(self.heartImg, 294, 4, 25, 42)
  p5Object.text(player.lives, 324, 38)
  if (player.invincible === true) {
    p5Object.image(self.starImg, 394, -15, 40, 69)
  }
}

DrawFroggerGame.prototype.renderMap = function (gems) {
  var self = this
  /* This array holds the relative URL to the image used
   * for that particular row of the game level.
   */
  var numRows = 6,
    numCols = 5,
    row, col

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
      p5Object.image(self.rowImages[row], col * 101, row * 83) // x,y,width,height
      var gemType = gems[row][col]
      switch (gemType) {
        case 0:
          break
        case 1:
          p5Object.image(self.blueGemImg, col * 101 + 25, row * 83 + 30, 50, 85) // x,y,width,height
          break
        case 2:
          p5Object.image(self.greenGemImg, col * 101 + 25, row * 83 + 30, 50, 85) // x,y,width,height
          break
        case 3:
          p5Object.image(self.orangeGemImg, col * 101 + 25, row * 83 + 30, 50, 85) // x,y,width,height
          break
        case 4:
          p5Object.image(self.heartImg, col * 101 + 25, row * 83 + 30, 50, 85) // x,y,width,height
          break
        case 5:
          p5Object.image(self.starImg, col * 101 + 25, row * 83 + 30, 50, 85) // x,y,width,height
          break
      }
    }
  }
}

DrawFroggerGame.prototype.playerRender = function (players, gameState) {
  var self = this
  if (gameState === 1) { //player only shows during gameplay

    var length = players.length
    for (var i = 0; i < length; i++) {
      var playerPos = players[i].getBoardPosition()

      if (i === 0) p5Object.image(self.playerImg, playerPos.x, playerPos.y)
      else {
        //console.log('x : ' + playerPos.x.toString() + ' y : ' + playerPos.y.toString())
        p5Object.image(self.player2Img, playerPos.x, playerPos.y)
      }

    }
  }
}

DrawFroggerGame.prototype.enemyRender = function (allEnemies) {
  var self = this
  allEnemies.forEach(function (enemy) {
    var enemyPos = enemy.getPosition()
    p5Object.image(self.enemyImg, enemyPos.x, enemyPos.y)
  })
}

DrawFroggerGame.prototype.popupRender = function (gameState) {
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
}

module.exports = DrawFroggerGame
