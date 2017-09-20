var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var Util = require('./socket_util')
var Game = require('./../client/src/FroggerGameLogic')

inherits(GameRoom, EventEmitter)

function GameRoom () {
  var self = this
  if (!(self instanceof GameRoom)) return new GameRoom()

  self.roomId = Math.random().toString(36).substr(2)

  self.gemSeed = Math.random().toString(36).substr(2)
  self.enemy1Seed = Math.random().toString(36).substr(2)
  self.enemy2Seed = Math.random().toString(36).substr(2)
  self.enemy3Seed = Math.random().toString(36).substr(2)

  self.game = new Game({
    seeds: self.getSeeds(),
    roomId: self.roomId
  })

  self.game.on("enemy initialize", function (data) {
    var response = {
      roomId: self.roomId,
      broadcast: true,
      time: Date.now(),
      enemyId: data.id,
      type: Util.ACTION_TYPE.ENEMY_INITIALIZE
    }

    self.emit('response', response)
  })

  self.messages = []
  self.gameInterval = null
  self.prevTick = 0
  // 여기 있어도 될까?
  self.processedInputs = []
  self.lastProcessedInput = []
}

GameRoom.prototype.getSeeds = function () {
  var self = this
  return {
    gemSeed: self.gemSeed,
    enemy1Seed: self.enemy1Seed,
    enemy2Seed: self.enemy2Seed,
    enemy3Seed: self.enemy3Seed
  }
}

GameRoom.prototype.generateSeeds = function () {
  var self = this

  self.gemSeed = Math.random().toString(36).substr(2)
  self.enemy1Seed = Math.random().toString(36).substr(2)
  self.enemy2Seed = Math.random().toString(36).substr(2)
  self.enemy3Seed = Math.random().toString(36).substr(2)
}

GameRoom.prototype.getPlayerNum = function () {
  var self = this
  return self.game.playerCnt
}

GameRoom.prototype.initGame = function () {
  var self = this
  // 일단 난 history 전송 안하고 이것만 한다.
  self.game.initGame() //0=not started, 1=playing, 2=game over

  self.lastTime = Date.now()
  var loop = function () {

    var now = Date.now(),
      dt = (now - self.lastTime) / 1000.0

    self.game.updateAll(dt)

    //console.log(self.allEnemies[0].x)
    self.lastTime = now
  }

  self.loopInterval = setInterval(loop.bind(self), 20)

  function gameLoop () {
    var self = this

    self.processInput()
    self.sendWorldState()
  }

  if (self.gameInterval) clearInterval(self.gameInterval)
  //일정 간격으로 새로운 플레이어가 왔는지 체크하고 game 내용을 초기화 해서 패킷을 보내 준다.
  self.gameInterval = setInterval(gameLoop.bind(self), 1000) // call every second

}

GameRoom.prototype.processInput = function () {
  var self = this

  while (self.messages.length !== 0) {
    var message = (self.messages.splice(0, 1))[0]

    if (!message) break

    // validInput 만들기
    //if(self.game.validInput()){

    self.game.players.forEach(function (player) {
      if (message.clientId === player.id) {
        // 여기서 받는 x,y는 delta 값이다
        self.game.playerUpdate(player, message.x, message.y)
        self.game.checkCollisions(player)
        self.lastProcessedInput[message.clientId] = message.sequenceNumber
        self.processedInputs.push(message)
      }
    })

  }
}

GameRoom.prototype.sendWorldState = function () {
  var self = this

  var world_state = self.processedInputs

  /*
  self.game.players.forEach(function (player) {
    world_state.push({
      playerId: player.id,
      x: player.col,
      y: player.row,
      processedInputs : self.processedInputs,
      lastProcessedInput: self.lastProcessedInput[player.id]
    })
  })
  */

  var response = {
    roomId: self.roomId,
    broadcast: true,
    time: Date.now(),
    seed: Math.random().toString(36).substr(2),
    type: Util.ACTION_TYPE.WORLDSTATE_RECEIVED,
    message: '',
    worldState: world_state
  }

  self.emit('response', response)

  self.processedInputs = []
}

GameRoom.prototype.pushClient = function (options) {
  var self = this

  self.game.addPlayer(options)
  self.lastProcessedInput[options.id] = 0
  var player = self.game.getPlayer(options.id)
  // 현재 추가된 클라이언트를 모든 클라이언트들에게 전송한다

  var response = {
    id: player.id,
    roomId: self.roomId,
    order: player.order,
    broadcast: true,
    time: Date.now(),
    type: Util.ACTION_TYPE.CONNECTION
  }

  self.emit('response', response)

  if (self.game.players.length > 1) {

    var response = {
      client_id: player.id,
      roomId: self.roomId,
      broadcast: false,
      time: Date.now(),
      seed: player.randomSeed,
      type: Util.ACTION_TYPE.FETCH_PLAYERS,
      otherPlayers: self.game.players
    }

    self.emit('response', response)

    console.log(self.game.players)
  }

}

// 클라이언트에서 들어온 이벤트를 관리하고 다른 클라이언트들로 broadcast 해 준다
// 그럼 나는 이 부분을 이용해서 queue를 처리하면 되겠다
GameRoom.prototype.clientEventHandler = function (message) {
  var self = this

  self.messages.push(message)
}

module.exports = GameRoom
