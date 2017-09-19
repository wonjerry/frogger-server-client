var SocketIO = require('socket.io-client');
var Main = require('./main');
window.onload = function () {
    new ClientManager();
};

function ClientManager() {
    var self = this;
    if (!(self instanceof ClientManager)) return new ClientManager();
    self.init();
}

ClientManager.prototype.init = function () {
    var self = this;
    self.startbutton = document.getElementById("startButton");
    self.startbutton.disabled = true;
    self.startbutton.addEventListener('click', function () {
        self.socket.emit('start' , {roomId : self.roomId});
    });

    self.socket = SocketIO(window.location.hostname + ':' + window.location.port);
    self.setupSocket();
};

ClientManager.prototype.setupSocket = function () {
    var self = this;

    self.socket.on('connect_failed', function () {
        self.socket.close();
        console.log('connect_failed');
    });

    self.socket.on('welcome', function (message) {
        self.roomId = message.roomId;
        // enemy seed도 따로 받아야 한다
        self.main = new Main(message);
        self.socket.on('game packet', self.socketHandler.bind(self));
    });

    self.socket.on('player number', function (data) {
        self.startbutton.innerHTML = "Players waiting in this room : " + data.num;
    });

    self.socket.on('activate start button', function () {

        self.startbutton.disabled = false;
    });


    // bugspeed와 gem배열이 들어올 수 있음
    self.socket.on('start', function (message) {
        document.body.innerHTML = "";
        self.main.startLoop();

        self.main.game.on('sendInput', function (param) {
            self.socket.emit('clientInput', param);
        });
    });

    self.socket.emit('join', 'hello');
};

ClientManager.prototype.socketHandler = function (message) {
    var self = this;
    // 여기서 이제 다른 player의 데이터를 동기화 하거나
    // 일단 클라이언트의 입력에 따라 서버에서 처리가 제대로 되는지 파악 해 보자
    if (message.type === 0) {
        if(message.id === self.socket.id) return;
        self.main.game.addPlayer(message);
    } else if (message.type === 5) {
        if (self.main.game.gameState !== 1) return;
        self.main.game.messages.push(message);
    } else if (message.type === 6) {

        var length = message.otherPlayers.length;
        var localPlayerId = self.socket.id;
        var otherPlayers = message.otherPlayers;

        for (var i = 0; i < length; i++) {
            if (otherPlayers[i].id == localPlayerId) continue;

            self.main.game.addPlayer({order: otherPlayers[i].order, id: otherPlayers[i].id});
        }

        console.log(self.main.game.players)
    }
};
