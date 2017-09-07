var Gems = require('./Gems');
var Player = require('./Player');
var Enemy = require('./Enemy');
var Popup = require('./Popup');
var SeedRandom = require('SeedRandom');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

inherits(FroggerGame, EventEmitter);

// RommManager에서는 pushClient 할 떄 randomSeed를 받았지만
// 내 게임에서는 FrooggerGame 만들 때 randomSeed를 받는다.
// 클라이언트는 서버와 연결 시 초기에 randomSeed를 받는다.
function FroggerGame(options) {
    var self = this;
    if (!(self instanceof FroggerGame)) return new FroggerGame(options);

    self.gameState = 0; // 시퀀셜 진행

    // game data를 초기화 한다.
    self.players = [];
    self.playerCnt = 0;
    self.clientId = null;

    self.randomSeed = options.seed || Date.now();
    self.random = SeedRandom(self.randomSeed);

    self.roomId = options.roomId;

    self.messages = [];

    self.key_right = false;
    self.key_left = false;
    self.key_up = false;
    self.key_down = false;
    self.sequenceNumber = 0;
    self.pendingInputs = [];
}

// RoomManager에서 socket.id를 받는다.
// options는 추가될 수 있음
// 나중에 otherPlayer 들어오면 이거가지고 조정 해 줘야되는데 id만 받으면 안됨
FroggerGame.prototype.addPlayer = function (options) {
    var self = this;
    self.playerCnt++;
    // 서버와 클라이언트가 order를 적용하는 방식이 달라서 이렇게 했다.
    options.order = options.order || self.playerCnt;

    var player = new Player(options);
    if (self.clientId === null) self.clientId = options.id;
    self.players[options.id] = player;
};

FroggerGame.prototype.deletePlayer = function (options) {
    var self = this;
    // 추가적이 행위가 필요할 수 있다.
    self.playerCnt--;
    delete self.players[options.id];
};

FroggerGame.prototype.getPlayer = function () {
    var self = this;
    if (self.clientId !== null) return self.players[self.clientId];
    else return null;
};

FroggerGame.prototype.initGame = function () {
    var self = this;
    // 일단 난 history 전송 안하고 이것만 한다.
    self.gameState = 1; //0=not started, 1=playing, 2=game over
    self.level = 1;

    self.gems = new Gems();
    self.bug1 = new Enemy();
    self.bug2 = new Enemy();
    self.bug3 = new Enemy();
    self.allEnemies = [self.bug1, self.bug2, self.bug3];

    self.bug1.initialize(self.gameState, self.level);
    self.bug2.initialize(self.gameState, self.level);
    self.bug3.initialize(self.gameState, self.level);

    self.popup = new Popup();
};
// 클라이언트에서만 한다.
FroggerGame.prototype.checkCollisions = function () {
    var self = this;
    var player = self.players[self.clientId];
    if (player.invincible === false && self.gameState == 1) {
        for (i = 0; i < self.allEnemies.length; i++) {
            var enemy = self.allEnemies[i];
            if (player.x < enemy.x + enemy.width && player.x + enemy.width > enemy.x &&
                player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
                player.lives -= 1;
                if (player.lives === 0) {
                    // 여기서도 서버에서 뭔가 처리 해 주어야할 부분이 있음
                    // emit을 통해 서버로
                    self.gameState = 2;
                    return;
                } else {
                    player.initialize();
                    return;
                }
            }
        }
    }
};
// 클라이언트에서만 한다.

FroggerGame.prototype.processServerMessages = function () {
    while(true){

        //var message = self.messages.splice(0,1);
        //if(!message || message.length === 0) return;

        console.log(self.messages);

    }
};


FroggerGame.prototype.processInput = function () {

    var self = this;
    var input = null;

    if (self.key_left) {
        input = {
            x: -1,
            y: 0
        };
    } else if (self.key_right) {
        input = {
            x: 1,
            y: 0
        };
    } else if (self.key_up) {
        input = {
            x: 0,
            y: -1
        };
    } else if (self.key_down) {
        input = {
            x: 0,
            y: 1
        };
    } else {
        return;
    }

    // 서버로 input을 전송한다
    input.sequenceNumber = self.sequenceNumber++;
    input.clientId = self.clientId;
    input.roomId = self.roomId;
    self.emit('sendInput', input);

    self.playerUpdate(self.players[self.clientId], input.x, input.y);

    self.pendingInputs.push(input);

};
FroggerGame.prototype.handleInput = function (key) {

    var self = this;

    if (self.gameState == 1) { //while playing the game
        switch (key) {
            case 'left':
                self.key_left = true;
                break;
            case 'right':
                self.key_right = true;
                break;
            case 'up':
                self.key_up = true;
                break;
            case 'down':
                self.key_down = true;
                break;
            case 'key_Released':
                self.key_right = false;
                self.key_left = false;
                self.key_up = false;
                self.key_down = false;
                break;

        }
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

FroggerGame.prototype.updateAll = function (dt) {
    var self = this;

    self.allEnemies.forEach(function (enemy) {
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
FroggerGame.prototype.playerUpdate = function (player, deltaX, deltaY) {
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

    player.applyInput(player.col + deltaX, player.row + deltaY);

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

    if (pickup !== 0 && pickup !== undefined) self.gems.gemCnt--;
    //cell is now empty
    // 여기서서버로 알려서 다른 클라이언트에게 알려야겠다.
    self.gems.gemGrid[player.row][player.col] = 0;
    //update actual position
    player.x = player.col * 100;
    player.y = player.row * 83 - 30;

    if (self.gems.gemCnt <= 0) {
        self.level++;
        self.gems.initialize();
        player.initialize();
        self.allEnemies.forEach(function (enemy) {
            enemy.initialize(self.gameState, self.level);
        });
    }
};

FroggerGame.prototype.checkBound = function (position, deltaX, deltaY) {
    var x = position.x + deltaX,
        y = position.y + deltaY;
    if (y > 5 || x > 4 || x < 0 || y < 0) return false;
    return true;
};

FroggerGame.prototype.checkOtherPlayers = function (position, deltaX, deltaY) {
    var self = this;
    /*
    var x = position.x + deltaX,
        y = position.y + deltaY;

    self.players.forEach(function (player) {
        if (player.col === x && player.row === y) return false;
    });
    */
    return true;
};

module.exports = FroggerGame;
