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
