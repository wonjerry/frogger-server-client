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
