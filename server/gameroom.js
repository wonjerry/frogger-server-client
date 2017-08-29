var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

var Util = require('./socket_util')
var Player = require('./../client/FroggerGameLogic')

/**
 * GameRoom
 *
 * @event userleave 유저가 방을 나가는 액션을 할 때 호출. socket disconnect할 땐 반대로 roomManager에서 메소드를 호출한다.
 */
inherits(GameRoom, EventEmitter);
// option에는 room_id가 들어온다.
function GameRoom(options) {
    var self = this;
    if (!(self instanceof GameRoom)) return new GameRoom(options);

    // id 배정
    // 순차적으로 배정하는 것이 아닌 random 값을 지정 해 주고 일정 범위 내에서 돌려 쓰는 듯 하다.
    // 그래서 roomManager에서 이중 체크를 하는 것 같다.
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
}

GameRoom.prototype.initGame = function() {
    var self = this;
    // gameState를 READY로 바꾼다.
    self.ChangeGameState(Util.GAMESTATES.READY);
    
    function gameLoop() {
        var self = this;
        for (var key in self.players) {
            if (self.players.hasOwnProperty(key)) {
                // player가 있는지 체크한다.
                var player = self.players[key];
                var response = {
                    client_id: player.id,
                    room_id: self.room_id,
                    broadcast: false,
                    // history 발생 시간을 위한 것
                    time: Date.now(),
                    // 이건 왜보내줄까??
                    seed: Math.random().toString(36).substr(2),
                    type: Util.ACTION_TYPE.SEED_RECIVED,
                    message: ''
                };
                // RoomManager로 response를 보내서 해당 클라이언트에게 game packet을 보낸다.
                // 서버, 클라이언트에서는 self.randomSeed를 업데이트 한다.
                // 클라이언트에서는 기록 해 두다가 복구 신호가 가면 가장 최근 history로 복구 하는 듯 하다.
                // 나는 seed를 막 업데이트를 계속 해 주어야 하는 것은 아닌 것 같다.
                // 일단 seed업데이트, history 저장은 안하는 것으로 한다.
                //player.pushHistory(response.time, response.seed, response.type, response.message);
                self.emit('response', response);
            }
        }
    }

    if (self.gameInterval) clearInterval(self.gameInterval);
    //일정 간격으로 새로운 플레이어가 왔는지 체크하고 game 내용을 초기화 해서 패킷을 보내 준다.
    self.gameInterval = setInterval(gameLoop.bind(self), 1000 * 100); // call every second
};

// 새로운 플레이어 생성
GameRoom.prototype.pushClient = function(options) {
    var self = this;
    // RoomManager에서 socket.id, mapsize, randomSeed를 넘겨 받는다.
    // player, 즉 게임을 생성한다.
    var player = new Player(options);
    // 지금 room에 접속 되어있는 전부에게 새로운 플레이어가 들어왔다는 것을 알리기 위해
    // broadcast = true로 설정하고 response data를 보낸다.
    var response = {
        client_id: options.id,
        room_id: self.room_id,
        broadcast: true,
        time: Date.now(),
        seed: player.randomSeed,
        type: Util.ACTION_TYPE.CONNECTION,
        message: options.mapsize
    }
    //player.pushHistory(response.time, response.seed, response.type, response.message)
    // RoomManager로 데이터가 넘어가고, 모든 client들에게 해당 플레이어의 정보가 업데이트 된다.
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
    // 해당 player를 배열에 넣는다.
    self.players[options.id] = player
}

/**
 * clientEventHandler
 *
 * @param {*} message {
 *  client_id: String
 *  room_id: String
 *  time: Timetic by client,
    seed: current seed number for random
    type: (0 for player connection, 1 for recieved seed transfer, 2 for player made action),
    message: any
 * }
 * @event {*} response {
 *  client_id: String
 *  room_id: String
 broadcast:
 time:
 seed:
 type:
 message: any :: send random seed, send otherPlayer's action and connection info, restore otherPlaye's game by history
 * }
 */
 // 클라이언트에서 gamepacket이 오면 호출 된다.
GameRoom.prototype.clientEventHandler = function(message) {
    var self = this
    // 해당 클라이언트의 game 객체를 찾는다.
    var player = self.players[message.client_id]
    // debug('got action' + JSON.stringify(message))

        // client id -> action
    if (self.gameState == Util.GAMESTATES.READY) {
        if (message.type == Util.ACTION_TYPE.ACTION_MADE) {
            // GameLogic의 syncAction을 통해 데이터를 동기화 한다.
            //self.players[message.client_id].syncAction(message.message.from, message.message.to, message)
            // broadcast to others
            var response = {
                client_id: player.id,
                room_id: self.room_id,
                broadcast: true,
                time: message.time,
                seed: message.seed,
                type: message.type,
                message: message.message
            }
            // 다른 플레이어에게 해당 클라이언트의 움직임 정보를 전송한다.
            self.emit('response', response)
        }
    } else {
        debug('ignore client action: ' + JSON.stringify(message))
    }
}
/*
// RoomManager의 userDisconnect에서 호출된다.
GameRoom.prototype.updateDisconectedUser = function(client_id) {
    var self = this
    // 클라이언트의 연결이 해제되면
    // 해당 클라이언트의 객체를 가져온다.
    // type의 Util.ACTION_TYPE.DISCONNECT로 지정한다.
    // 다른 클라이언트들에게 보낸다.
    if (self.players[client_id]) {
        var response = {
            client_id: client_id,
            room_id: self.room_id,
            broadcast: true,
            type: Util.ACTION_TYPE.DISCONNECT
        }
        self.emit('response', response)
        // players 배열에서 제거한다.
        delete self.players[client_id]
    }
    debug('client: ' + client_id + ' disconnect from room: ' + self.room_id)
}
*/
module.exports = GameRoom
