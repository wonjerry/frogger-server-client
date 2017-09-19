var SeedRandom = require('SeedRandom')

function Gems (randomSeed) {
  var self = this
  self.gemGrid = [
    [],
    [],
    [],
    [],
    [],
    []
  ]

  self.setRandomSeed(randomSeed)

  self.initialize()
}

Gems.prototype.setRandomSeed = function (seed) {
  var self = this

  self.randomseed = seed
  self.random = SeedRandom(self.randomseed)
}

//lay gems at random at the start of each level
Gems.prototype.initialize = function () {
  var self = this
  self.gemCnt = 0
  for (var i = 1; i < 4; i++) { //rows (only the paved ones)
    for (var j = 0; j < 5; j++) { //columns
      //choose whether each square should contain a gem, heart, star, or nothing
      // 이 부분도 random seed로 처리해야됨
      var random = Math.floor(self.random() * 100)
      if (random >= 50) self.gemCnt++

      switch (true) {
        case (random < 50):
          self.gemGrid[i][j] = 0
          break
        case (random < 75):
          self.gemGrid[i][j] = 1
          break
        case (random < 90):
          self.gemGrid[i][j] = 2
          break
        case (random < 95):
          self.gemGrid[i][j] = 3
          break
        case (random < 98):
          self.gemGrid[i][j] = 4
          break
        case (random < 100):
          self.gemGrid[i][j] = 5
          break
      }
    }
  }
}

module.exports = Gems
