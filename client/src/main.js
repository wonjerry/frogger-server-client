var DrawModule = require('./FroggerGameBoard')
var FroggerGame = require('./FroggerGameLogic')

function Main (gameInfo) {

  var self = this
  if (!(self instanceof Main)) return new Main(id)
  self.allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space',
    82: 'restart'
  }

  self.game = new FroggerGame(gameInfo)
  self.game.addPlayer({id: gameInfo.id, order: gameInfo.order})

  self.p5sketch = function (p) {
    self.drawObj = new DrawModule()

    p.preload = function () {
      self.drawObj.init(p)
      self.game.initGame()
    }

    p.setup = function () {
      var scale = self.drawObj.getScale()
      p.createCanvas(scale.w, scale.h)
      p.frameRate(50)
      self.lastTime = Date.now()
      self.inputIntervalTime = self.lastTime
    }

    p.draw = function () {
      p.clear()

      var now = Date.now(),
        dt = (now - self.lastTime) / 1000.0

      self.game.processServerMessages()

      if ((now - self.inputIntervalTime) / 1000.0 > 4 * dt) {
        self.inputIntervalTime = now
        self.game.processInput()
      }

      self.game.updateAll(dt)

      self.drawObj.render(self.game.players, self.game.level, self.game.allEnemies, self.game.gameState, self.game.gems.gemGrid)

      self.lastTime = now
    }

    p.keyPressed = function () {
      self.game.handleInput(self.allowedKeys[p.keyCode])
    }

    p.keyReleased = function () {
      self.game.handleInput('key_Released')
    }

  }
}

Main.prototype.startLoop = function () {
  var self = this
  new p5(self.p5sketch, 'myp5sketch')
}

module.exports = Main
