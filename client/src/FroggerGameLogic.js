var Gems = require('./Gems')
var Player = require('./Player')
var Enemy = require('./Enemy')
var Popup = require('./Popup')

var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

inherits(FroggerGame, EventEmitter)

// RommManager에서는 pushClient 할 떄 randomSeed를 받았지만
// 내 게임에서는 FrooggerGame 만들 때 randomSeed를 받는다.
// 클라이언트는 서버와 연결 시 초기에 randomSeed를 받는다.
function FroggerGame (options) {
  var self = this
  if (!(self instanceof FroggerGame)) return new FroggerGame(options)

  self.gameState = 0 // 시퀀셜 진행

  // game data를 초기화 한다.
  self.players = []
  self.playerCnt = 0
  self.clientId = null

  self.roomId = options.roomId

  self.messages = []

  self.key_right = false
  self.key_left = false
  self.key_up = false
  self.key_down = false
  self.sequenceNumber = 0
  self.pendingInputs = []

  self.gems = new Gems(options.seeds.gemSeed)

  self.bug1 = new Enemy(options.seeds.enemy1Seed, 0)
  self.bug2 = new Enemy(options.seeds.enemy2Seed, 1)
  self.bug3 = new Enemy(options.seeds.enemy3Seed, 2)

  console.log(self.bug1.id)
  console.log(self.bug2.id)
  console.log(self.bug3.id)

  self.allEnemies = [self.bug1, self.bug2, self.bug3]
}

FroggerGame.prototype.setSeeds = function (seeds) {
  var self = this

  self.gems.setRandomSeed(seeds.gemSeed)
  self.bug1.setRandomSeed(seeds.enemy1Seed)
  self.bug2.setRandomSeed(seeds.enemy2Seed)
  self.bug3.setRandomSeed(seeds.enemy3Seed)
}

// RoomManager에서 socket.id를 받는다.
// options는 추가될 수 있음
// 나중에 otherPlayer 들어오면 이거가지고 조정 해 줘야되는데 id만 받으면 안됨
FroggerGame.prototype.addPlayer = function (options) {
  var self = this
  self.playerCnt++

  // 서버와 클라이언트가 order를 적용하는 방식이 달라서 이렇게 했다.
  options.order = options.order || self.playerCnt

  self.players.push(new Player(options))
}

FroggerGame.prototype.deletePlayer = function (options) {
  var self = this
  // 추가적이 행위가 필요할 수 있다.
  self.playerCnt--
  // players를 순회하면서 option에 있는 id와 같은 player를 삭제하도록 한다
  delete self.players[0]
}

FroggerGame.prototype.getPlayer = function (id) {
  var self = this
  var player = null
  if (id) {
    self.players.forEach(function (ele) {
      if (ele.id === id) {
        player = ele
      }
    })
  } else {
    player = self.players[0]
  }

  return player
}

FroggerGame.prototype.initGame = function () {
  var self = this
  // 일단 난 history 전송 안하고 이것만 한다.
  self.gameState = 1 //0=not started, 1=playing, 2=game over
  self.level = 1

  self.bug1.initialize(self.gameState, self.level)
  self.bug2.initialize(self.gameState, self.level)
  self.bug3.initialize(self.gameState, self.level)

  self.popup = new Popup()

}

// 클라이언트에서만 한다.
FroggerGame.prototype.checkCollisions = function (somePlayer) {
  var self = this
  var player = somePlayer || self.players[0]
  if (player.invincible === false && self.gameState === 1) {
    for (i = 0; i < self.allEnemies.length; i++) {
      var enemy = self.allEnemies[i]
      if (player.x < enemy.x + enemy.width && player.x + enemy.width > enemy.x &&
        player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
        player.lives -= 1
        if (player.lives === 0) {
          // 여기서도 서버에서 뭔가 처리 해 주어야할 부분이 있음
          // emit을 통해 서버로
          self.gameState = 2
          return
        } else {
          player.initialize()
          return
        }
      }
    }
  }
}
// 클라이언트에서만 한다.

FroggerGame.prototype.processServerMessages = function () {
  var self = this

  while (self.messages.length !== 0) {

    var message = self.messages.splice(0, 1)

    var worldStates = message[0].worldState

    var length = worldStates.length

    for (var i = 0; i < length; i++) {
      for (var j = 1; j < self.players.length; j++) {

        if (self.players[j].id === worldStates[i].clientId) {
          self.playerUpdate(self.players[j], worldStates[i].x, worldStates[i].y)
        }
      }
    }

    /*
    while (worldStates.length !== 0) {

      var state = (worldStates.splice(0, 1))[0]

      if (self.players[0].id !== state.playerId) {

        self.players.forEach(function (ele) {
          if (ele.id === state.playerId) {
            //self.playerUpdate(ele)
            ele.col = state.x
            ele.row = state.y
          }

        })

      }

    }*/

  }
}

FroggerGame.prototype.processInput = function () {

  var self = this
  var input = null

  if (self.key_left) {
    input = {
      x: -1,
      y: 0
    }
  } else if (self.key_right) {
    input = {
      x: 1,
      y: 0
    }
  } else if (self.key_up) {
    input = {
      x: 0,
      y: -1
    }
  } else if (self.key_down) {
    input = {
      x: 0,
      y: 1
    }
  } else return

  if (!self.playerUpdate(self.players[0], input.x, input.y)) return

  input.sequenceNumber = self.sequenceNumber++
  input.clientId = self.players[0].id
  input.roomId = self.roomId
  self.emit('sendInput', input)

  self.pendingInputs.push(input)

}

FroggerGame.prototype.handleInput = function (key) {

  var self = this

  if (self.gameState === 1) { //while playing the game
    switch (key) {
      case 'left':
        self.key_left = true
        break
      case 'right':
        self.key_right = true
        break
      case 'up':
        self.key_up = true
        break
      case 'down':
        self.key_down = true
        break
      case 'key_Released':
        self.key_right = false
        self.key_left = false
        self.key_up = false
        self.key_down = false
        break

    }
  }
}

FroggerGame.prototype.updateAll = function (dt) {
  var self = this
  console.log(dt);

  self.allEnemies.forEach(function (enemy) {

    if (enemy.x > 550) {
      // 여기 gameState 드가야됨
      enemy.initialize(self.gameState, self.level)
      self.emit('enemy initialize', {id: enemy.id})

    } else enemy.move(dt)

    //enemy.update(dt, self.gameState, self.level)
  })

  self.checkCollisions()
}

FroggerGame.prototype.enemyInitialize = function (id) {
  var self = this

  self.allEnemies[id].initialize(self.gameState, self.level)

}

// 서버에서 이거 굴리면 되겠는데?
// player 움직이면 그 데이터가 올꺼고,
// 그 데이터 받아서 타당한 움직임인지 판정해야되고,
// gems도 업데이트 시켜야되고,
// player 점수도 업데이트 해야되고,
// gemCount 세서 levelUP도 시켜야되고
// 이걸 다 처리하고 해당 내용을 다른 client들에게도 전송 해 줘야 한다. 그리고 그것들이 다 동기화 되어야 한다.
FroggerGame.prototype.playerUpdate = function (player, deltaX, deltaY) {
  var self = this

  if (!self.checkBound(player.getPosition(), deltaX, deltaY) || !self.checkOtherPlayers(player.getPosition(), deltaX, deltaY)) {
    // 서버측이라면 restore를 해야한다.
    // 이벤트를 발생 시키고 그걸 RoomManager의 gameRoom 객체에서 처리 하도록 하자.
    // 클라이언트에서는 아무일도 발생 하지 않아야하고
    // 서버에서는 처리해야한다.
    // 따라서 emitter를 활용 이벤트만 발생 시키자.
    // 그러면 클라이언트든, 서버든 별 문제없이 돌아 갈 수 있다.
    // self.emit('response' , response); 이런식으로 전송
    return false
  }

  player.applyInput(deltaX, deltaY)

  //collect any gems
  var pickup = self.gems.gemGrid[player.row][player.col]
  switch (pickup) {
    case 1:
      player.score += 1
      break
    case 2:
      player.score += 2
      break
    case 3:
      player.score += 10
      break
    case 4:
      player.lives += 1
      break
    case 5:
      player.invincible = true
      break
  }

  if (pickup !== 0 && pickup !== undefined) self.gems.gemCnt--
  //cell is now empty
  // 여기서서버로 알려서 다른 클라이언트에게 알려야겠다.
  self.gems.gemGrid[player.row][player.col] = 0

  if (self.gems.gemCnt <= 0) {
    self.level++
    // 이 부분을 서버로 시그널을 전송하고 응답이 오기를 기다린 다음 initial 하는 방법으로 바꿀 수도 있다
    self.gems.initialize()
    player.initialize()

    self.allEnemies.forEach(function (enemy) {
      enemy.initialize(self.gameState, self.level)
    })

  }

  return true
}

FroggerGame.prototype.checkBound = function (position, deltaX, deltaY) {
  var x = position.x + deltaX,
    y = position.y + deltaY

  return !(y > 5 || x > 4 || x < 0 || y < 0)
}

FroggerGame.prototype.checkOtherPlayers = function (position, deltaX, deltaY) {
  var self = this
  /*
  var x = position.x + deltaX,
      y = position.y + deltaY;

  self.players.forEach(function (player) {
      if (player.col === x && player.row === y) return false;
  });
  */
  return true
}

module.exports = FroggerGame
