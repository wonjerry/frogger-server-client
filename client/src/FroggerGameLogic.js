var Gems = require('./Gems');
var Player = require('./Player');
var Enemy = require('./Enemy');
var Popup = require('./Popup');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Util = require('./../../server/socket_util');

inherits(FroggerGame, EventEmitter);

// RommManager에서는 pushClient 할 떄 randomSeed를 받았지만
// 내 게임에서는 FrooggerGame 만들 때 randomSeed를 받는다.
var FroggerGame = function(options) {
  var self = this;
  if (!(self instanceof GameRoom)) return new GameRoom(options);

  self.randomSeed = options.randomSeed || Date.now();
  self.random = SeedRandom(self.randomSeed);

  self.room_id = options.room_id || Math.random().toString(36).substr(2);
  self.gameState = Util.GAMESTATES.INIT; // 시퀀셜 진행
  // game data를 초기화 한다.
  self.players = {};
  self.gameInterval = null;
  self.prevTick = 0;
  self.ChangeGameState = function(state) {
    self.gameState = state;
    self.prevTick = Date.now();
  };
};
// RoomManager에서 socket.id를 받는다.
// options는 추가될 수 있음
FroggerGame.prototype.pushClient = function(options) {
  var self = this;

  var player = new Player(options);

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

  // 해당 player를 배열에 넣는다.
  self.players[options.id] = player;
};

FroggerGame.prototype.initGame = function() {
  var self = this;
  // 일단 난 history 전송 안하고 이것만 한다.
  self.ChangeGameState(Util.GAMESTATES.READY); //0=not started, 1=playing, 2=game over
  self.level = 1;

  self.gems = new Gems();
  self.players = {};

  self.bug1 = new Enemy();
  self.bug2 = new Enemy();
  self.bug3 = new Enemy();
  self.allEnemies = [self.bug1, self.bug2, self.bug3];

  self.bug1.initialize(self.gameState, self.level);
  self.bug2.initialize(self.gameState, self.level);
  self.bug3.initialize(self.gameState, self.level);

  self.popup = new Popup();
};

////////////////////서버/////////////////////
// 클라이언트에서 들어온 이벤트를 관리한다.
FroggerGame.prototype.clientEventHandler = function(message) {
  var self = this;
  // 해당 클라이언트의 game 객체를 찾는다.
  var player = self.players[message.client_id];

  if (self.gameState == Util.GAMESTATES.READY) {
    if (message.type == Util.ACTION_TYPE.ACTION_MADE) {
      // GameLogic의 syncAction을 통해 데이터를 동기화 한다.
      // 현재 client 의 x,y에서 클라이언트에서 온
      // 인덱스 체크, 다른 플레이어 체크 -> true가 나와야만 함
      // 클라이언트에서는 인덱스가 넘어가지 않거나 다른 플레이어가 없는 방향으로만 움직 일 것이기 때문
      // 현재 서버에 있는 클라이언트의 위치를 fromPos, 클라이언트에서 온 위치 변화량을 deltaX,deltaY;
      // 나중엔 이 부분이 if문으로 판단 되어 restore할지 말지를 결정
      if (!self.playerUpdate(player, message.deltaX, message.deltaY)) {
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
};

FroggerGame.prototype.checkCollisions = function() {
  var self = this;
  if (self.player.invincible === false && self.gameState == Util.GAMESTATES.READY) {
    for (i = 0; i < self.allEnemies.length; i++) {
      var enemy = self.allEnemies[i];
      // bounding box collision detection
      if (self.player.x < enemy.x + enemy.width && self.player.x + enemy.width > enemy.x &&
        self.player.y < enemy.y + enemy.height && self.player.y + self.player.height > enemy.y) {
        self.player.lives -= 1;
        if (self.player.lives === 0) {
          // 여기서도 서버에서 뭔가 처리 해 주어야할 부분이 있음
          // emit을 통해 서버로
          self.ChangeGameState(Util.GAMESTATES.FINISH);
          return;
        } else {
          self.player.initialize();
          return;
        }
      }
    }
  }
};

FroggerGame.prototype.handleInput = function(id, key) {
  var self = this;
  var deltaX = 0,
    deltaY = 0;
  if (self.gameState == Util.GAMESTATES.READY) { //while playing the game
    switch (key) {
      case 'left':
        deltaX = -1;
        break;
      case 'right':
        deltaX = 1;
        break;
      case 'up':
        deltaY = -1;
        break;
      case 'down':
        deltaY = 1;
        break;
    }
    // updateAll에서 update시키면 쓸데없이 많은 비교를 하게 된다.
    self.playerUpdate(self.players[id], deltaX, deltaY);
  }
  /*
  else if (self.gameState == Util.GAMESTATES.INIT) { //to start the game
    if (key === 'space') {
      self.gameState = 1;
    }
  } else if (self.gameState == Util.GAMESTATES.FINISH) {
    if (key === 'restart') {
      self.init();
    }
  }
  */
};

FroggerGame.prototype.updateAll = function(dt) {
  var self = this;

  self.allEnemies.forEach(function(enemy) {
    enemy.update(dt, self.gameState, self.level);
  });

  self.checkCollisions();
};

// 서버에서 이거 굴리면 되겠는데?
// player 움직이면 그 데이터가 올꺼고,
// 그 데이터 받아서 타당한 움직임인지 판정해야되고,
// gems도 업데이트 시켜야되고,
// player 점수도 업데이트 해야되고,
// gemCount 세서 levelUP도 시켜야되고
// 이걸 다 처리하고 해당 내용을 다른 client들에게도 전송 해 줘야 한다. 그리고 그것들이 다 동기화 되어야 한다.
FroggerGame.prototype.playerUpdate = function(player, deltaX, deltaY) {
  var self = this;

  if (!self.checkBound(player.getPosition(), deltaX, deltaY) || !self.checkOtherPlayers(player.getPosition(), deltaX, deltaY)) {
    // 서버측이라면 restore를 해야한다.
    // 이벤트를 발생 시키고 그걸 RoomManager의 gameRoom 객체에서 처리 하도록 하자.
    // 클라이언트에서는 아무일도 발생 하지 않아야하고
    // 서버에서는 처리해야한다.
    // 따라서 emitter를 활용 이벤트만 발생 시키자.
    // 그러면 클라이언트든, 서버든 별 문제없이 돌아 갈 수 있다.
    // self.emit('response' , response); 이런식으로 전송
    return;
  }

  player.col += deltaX;
  player.row += deltaY;

  //collect any gems
  var pickup = self.gems.gemGrid[player.row][player.col];
  switch (pickup) {
    case 1:
      player.score += 1;
      break;
    case 2:
      player.score += 2;
      break;
    case 3:
      player.score += 10;
      break;
    case 4:
      player.lives += 1;
      break;
    case 5:
      player.invincible = true;
      break;
  }

  if (pickup !== 0) self.gem.gemCnt--;
  //cell is now empty
  // 여기서서버로 알려서 다른 클라이언트에게 알려야겠다.
  self.gems.gemGrid[player.row][player.col] = 0;
  //update actual position
  player.x = player.col * 100;
  player.y = player.row * 83 - 30;

  if (self.gem.gemCnt <= 0) {
    console.log('levelUP!');
    self.gems.initialize();
    player.initialize();
    self.allEnemies.forEach(function(enemy) {
      enemy.initialize();
    });
  }
};

FroggerGame.prototype.checkBound = function(position, deltaX, deltaY) {
  var x = position.x + delatas.x,
    y = position.y + deltas.y;
  if (y > 5 || x > 4 || x < 0 || y < 0) return false;
  return true;
};

FroggerGame.prototype.checkOtherPlayers = function(position, deltaX, deltaY) {
  var self = this;

  var x = position.x + delatas.x,
    y = position.y + deltas.y;

    self.players.forEach(function(player){
      if(player.col === x && player.row === y) return false;
    });
  return true;
};

module.exports = FroggerGame;
