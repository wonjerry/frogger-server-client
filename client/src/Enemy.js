var SeedRandom = require('SeedRandom')

// Enemies our player must avoid
var Enemy = function (randomSeed , id) {
  var self = this
  self.width = 70
  self.height = 50
  self.id = id
  self.setRandomSeed(randomSeed)
}

Enemy.prototype.setRandomSeed = function (seed) {
  var self = this

  self.randomseed = seed
  self.random = SeedRandom(self.randomseed)
}

//setSpeed로 player의 레벨을 받아서 speed 값을 조정 해 주어야 한다.
Enemy.prototype.initialize = function (gameState, level) {
  var self = this
  if (gameState !== 2) { //unless game over
    self.speed = self.random() * level * 100 + 100 //choose initial speed at random
  } else {
    self.speed = 0
  }
  self.x = -100
  self.y = (Math.floor(self.random() * 3) + 1) * 83 - 30 //choose random row
}

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt, gameState, level) {
  var self = this
  // multiply movement by dt to ensure the game runs at the same speed for all computers
  //if bug has moved off right of screen, move it back to the start and initialize row and speed again
  if (self.x > 550) {
    // 여기 gameState 드가야됨
    self.initialize(gameState, level)
  } else {
    //bugs move at a constant speed and can overtake/overlap
    self.move(dt)
  }
}

Enemy.prototype.move = function (dt) {
  var self = this

  self.x = self.x + self.speed * dt
}

Enemy.prototype.getPosition = function () {
  var self = this
  return {
    x: self.x,
    y: self.y
  }
}

module.exports = Enemy
