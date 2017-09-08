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
    self.game = new Game({
        seed: self.seed
    });
    self.messages = [];
    self.gameInterval = null;
    self.prevTick = 0;
    // 여기 있어도 될까?
    self.lastProcessedInput = [];
}

GameRoom.prototype.getSeed = function () {
    var self = this;
    return self.seed;
};

GameRoom.prototype.getPlayerNum = function () {
    var self = this;
    return self.game.playerCnt;
};

GameRoom.prototype.initGame = function () {
    var self = this;
    // 일단 난 history 전송 안하고 이것만 한다.
    self.game.initGame(); //0=not started, 1=playing, 2=game over

    function gameLoop() {
        var self = this;

        self.processInput();

        self.sendWorldState();
    }

    if (self.gameInterval) clearInterval(self.gameInterval);
    //일정 간격으로 새로운 플레이어가 왔는지 체크하고 game 내용을 초기화 해서 패킷을 보내 준다.
    self.gameInterval = setInterval(gameLoop.bind(self), 1000) // call every second

};

GameRoom.prototype.processInput = function () {
    var self = this;

    while (true) {
        var message = (self.messages.splice(0, 1))[0];

        if (!message || message.length === 0) break;

        // validInput 만들기
        //if(self.game.validInput()){
        if (true) {
            self.game.players.forEach(function (player) {
                if (message.clientId === player.id) {
                    // 여기서 받는 x,y는 delta 값이다
                    player.applyInput(message.x, message.y);
                    self.lastProcessedInput[message.clientId] = message.sequenceNumber;
                }
            });
        }
    }
};

GameRoom.prototype.sendWorldState = function () {
    var self = this;

    var world_state = [];
    // 나중에 클라이언트 제안이 4로 바뀌면 바꿔주어야 할 부분이다
    var num_clients = 2;

    self.game.players.forEach(function (player) {
        world_state.push({
            playerId: player.id,
            x: player.col,
            y: player.row,
            lastProcessedInput: self.lastProcessedInput[player.id]
        });
    });

    var response = {
        room_id: self.room_id,
        broadcast: true,
        time: Date.now(),
        seed: Math.random().toString(36).substr(2),
        type: Util.ACTION_TYPE.WORLDSTATE_RECEIVED,
        message: '',
        worldState: world_state
    };

    self.emit('response', response);
};

GameRoom.prototype.pushClient = function (options) {
    var self = this;

    self.game.addPlayer(options);
    self.lastProcessedInput[options.id] = 0;
    var player = self.game.getPlayer(options.id);
    // 현재 추가된 클라이언트를 모든 클라이언트들에게 전송한다

    var response = {
        id: player.id,
        room_id : self.room_id,
        order: player.order,
        broadcast: true,
        time: Date.now(),
        type: Util.ACTION_TYPE.CONNECTION
    };

    self.emit('response', response);

    if (self.game.players.length > 1) {
        // 해당 클라이언트의 데이터와 otherplayers의 history를 response에 담아서 해당 클라이언트에게 보낸다.
        var response = {
            client_id: player.id,
            room_id: self.room_id,
            broadcast: false,
            time: Date.now(),
            seed: player.randomSeed,
            type: Util.ACTION_TYPE.FETCH_PLAYERS,
            otherPlayers: self.game.players
        };

        self.emit('response', response);

        console.log(self.game.players)
    }


};

// 클라이언트에서 들어온 이벤트를 관리하고 다른 클라이언트들로 broadcast 해 준다
// 그럼 나는 이 부분을 이용해서 queue를 처리하면 되겠다
GameRoom.prototype.clientEventHandler = function (message) {
    var self = this;
    self.messages.push(message);
};

module.exports = GameRoom;
