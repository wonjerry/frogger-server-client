// gameroom 모듈을 사용한다.
var GameRoom = require('./gameroom');
var MAX_CLIENT = 2;

function RoomManager(socketio) {
    var self = this;
    if (!(self instanceof RoomManager)) return new RoomManager(options);
    // gameRoom 들과 socket들을 가지고 있다.
    // 인자 값으로 들어오는 socketio 객체는 클라이언트 socket 전부를 관리하는 io 객체가 들어온다.
    self.gameRooms = {};
    self.sockets = [];
    self.io = socketio;
}

RoomManager.prototype.requestGameRoom = function (socket) {
    var self = this;
    // requestGameRoom하는 클라이언트에 대해 해당 클라이언트가 있는 room이 존재하지 않으면 해당 socket을 sockets 배열에 넣어둔다.
    if (!self.sockets.contains(socket)) {
        self.sockets.push(socket);
    }
    // 방이 있는지 없는지 체크하는 flag 이다.
    var hasJoined = false;
    // 순차적으로 빈 방이 있는지 확인, MAX_CLIENT 확인
    for (var key in self.gameRooms) {
        // key 변수에 gameroom의 id가 들어가게 된다.
        // key에 해당하는 값이 있는지 체크?
        if (self.gameRooms.hasOwnProperty(key)) {
            // 빈 방이 있으면 그 방을 가져온다.
            var gameroom = self.gameRooms[key];
            // 클라이언트가 꽉 차있으면 다른방을 찾는다.
            if (gameroom.getPlayerNum() + 1 > MAX_CLIENT) continue;

            socket.join(key);
            
            socket.emit('welcome', {
                seed: gameroom.getSeed(),
                order: gameroom.getPlayerNum()+1,
                roomId: gameroom.room_id
            });

            socket.on('clientInput',function (message) {

            });
            
            // client에게 주는 option은 추가될 수 있음
            gameroom.pushClient({
                id: socket.id
            });
            
            if(gameroom.getPlayerNum() === MAX_CLIENT){
                gameroom.initGame();
                self.io.in(gameroom.room_id).emit('start');
            }
            
            hasJoined = true;
        }
    }

    // 준비된 방이 없으면 새로 만든다.
    if (!hasJoined) {
        self.createGameRoom(socket);
    }

    // 게임 이벤트 핸들러를 바인딩한다.
    socket.on('clientInput', function (message) {
        var gameroom = self.gameRooms[message.roomId];
        gameroom.clientEventHandler.call(gameroom, message);
    });
};

RoomManager.prototype.createGameRoom = function (socket) {
    var self = this;
    // game에 들어가는 옵션은 추가될 수 있음
    var gameroom = new GameRoom({
        room_id: Math.random().toString(36).substr(2),
        seed: Math.random().toString(36).substr(2)
    });
    socket.join(gameroom.room_id);
    //gameroom.on('userleave', self.leaveGameRoom.bind(self));
    gameroom.on('response', self.roomResponse.bind(self));
    // room id가 randomSeed이다.
    gameroom.pushClient({
        id: socket.id
    });

    self.gameRooms[gameroom.room_id] = gameroom;
    socket.emit('welcome', {
        seed: gameroom.getSeed(),
        order: gameroom.getPlayerNum(),
        roomId: gameroom.room_id
    });
};

RoomManager.prototype.roomResponse = function (message) {
    var self = this;
    if (message.broadcast) {
        // debug(message)
        // 해당 room에 있는 클라이언트 전부에게 전송
        self.io.in(message.room_id).emit('game packet', message);
        console.log(message.worldState);
    } else {
        //해당 클라이언트에게만 전송
        self.io.to(message.client_id).emit('game packet', message);
    }
};

RoomManager.prototype.userDisconnect = function (socket) {
    var self = this
    // io 객체에 지정 되어 있는 room들을 가져온다.
    /*
    var rooms = self.io.sockets.adapter.rooms
    //debug('Rooms: ' + JSON.stringify(rooms))
    for (var key in rooms) {
        if (rooms.hasOwnProperty(key)) {
            if (self.gameRooms[key]) {
                if (self.gameRooms[key].players[socket.id]) {
                    self.gameRooms[key].updateDisconectedUser(socket.id)
                }
            }
        }
    }
    */
};

/*
RoomManager.prototype.leaveGameRoom = function(message) {
    var self = this
    var socket = self.io.sockets.connected[message.client_id]
    socket.leave(message.room_id)

    if (message.room_is_empty) delete self.gameRooms[message.room_id]
    // why??
    self.requestGameRoom(socket)
}
*/
// How do I check if an array includes an object in JavaScript?
// https://stackoverflow.com/questions/237104/how-do-i-check-if-an-array-includes-an-object-in-javascript
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

module.exports = RoomManager;
