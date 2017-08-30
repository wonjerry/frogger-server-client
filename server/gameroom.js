var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Util = require('./socket_util');
var Game = require('./../client/src/FroggerGameLogic');

inherits(GameRoom, EventEmitter);

function GameRoom(options) {
  var self = this;
  if (!(self instanceof GameRoom)) return new GameRoom(options);

  self.room_id = options.room_id || Math.random().toString(36).substr(2);
  self.seed = options.seed;

  self.initGame({seed : self.seed});
}

GameRoom.prototype.getSeed = function() {
  var self = this;
  return self.seed;
};

GameRoom.prototype.getPlayerNum = function() {
  var self = this;
  return self.game.playerCnt;
};

GameRoom.prototype.initGame = function(options) {
  var self = this;
  // 일단 난 history 전송 안하고 이것만 한다.
  self.game = new Game(options);
  self.game.initGame(); //0=not started, 1=playing, 2=game over
};

GameRoom.prototype.pushClient = function(options) {
  var self = this;

  self.game.addPlayer(options);

  /* 지금은 1인용이라 주석이지만 나중에는 추가 할 것 이다.
  var response = {
    client_id: options.id,
    room_id: self.room_id,
    broadcast: true,
    time: Date.now(),
    seed: player.randomSeed,
    type: Util.ACTION_TYPE.CONNECTION,
    message: options.mapsize
  }

  self.emit('response', response)


  // 다른 플레이어들의 history를 수집한다.
  var otherplayers = []
  for (var key in self.players) {
    if (self.players.hasOwnProperty(key)) {
      var tempplayer = self.players[key]
      otherplayers.push(tempplayer.history)
    }
  }
  if (otherplayers.length > 0) {
    // 해당 클라이언트의 데이터와 otherplayers의 history를 response에 담아서 해당 클라이언트에게 보낸다.
    var response = {
      client_id: player.id,
      room_id: self.room_id,
      broadcast: false,
      time: Date.now(),
      seed: player.randomSeed,
      type: Util.ACTION_TYPE.STATE_RESTORE,
      message: otherplayers
    }
    self.emit('response', response)
  }

  */

};

GameRoom.prototype.clientEventHandler = function(message) {
  var self = this;
  // 해당 클라이언트의 game 객체를 찾는다.
  var player_id = message.client_id;

  /*
  if (self.gameState == Util.GAMESTATES.READY) {
    if (message.type == Util.ACTION_TYPE.ACTION_MADE) {
      // GameLogic의 syncAction을 통해 데이터를 동기화 한다.
      // 현재 client 의 x,y에서 클라이언트에서 온
      // 인덱스 체크, 다른 플레이어 체크 -> true가 나와야만 함
      // 클라이언트에서는 인덱스가 넘어가지 않거나 다른 플레이어가 없는 방향으로만 움직 일 것이기 때문
      // 현재 서버에 있는 클라이언트의 위치를 fromPos, 클라이언트에서 온 위치 변화량을 deltaX,deltaY;
      // 나중엔 이 부분이 if문으로 판단 되어 restore할지 말지를 결정
      // 새로 만들어야됨.
      if (!self.game.checkValidate(player_id, message.deltaX, message.deltaY)) {
        // type을 바꾼다던지 해서 client에서 가지고 있는 history로 restore 하게 한다.
        console.log('playerUpdate false');
      }

      var response = {
        client_id: player.id,
        room_id: self.room_id,
        // 이걸 true로 만들어야 다른 플레이어와 위치 공유
        broadcast: false,
        seed: message.seed,
        type: message.type,
        message: message.message
      };
      // 다른 플레이어에게 해당 클라이언트의 움직임 정보를 전송한다.
      self.emit('response', response);
    }
  } else {
    //console.log('ignore client action: ' + JSON.stringify(message));
  }

  */
  var response = {
    client_id: player.id,
    room_id: self.room_id,
    // 이걸 true로 만들어야 다른 플레이어와 위치 공유
    broadcast: true,
    seed: message.seed,
    type: message.type,
    message: 'hi there!'
  };
  // 다른 플레이어에게 해당 클라이언트의 움직임 정보를 전송한다.
  self.emit('response', response);

};

module.exports = GameRoom;
