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

        self.main = new Main({
            id: self.socket.id,
            seed: message.seed,
            order: message.order,
            roomId : message.roomId
        });
    });
    // bugspeed와 gem배열이 들어올 수 있음
    self.socket.on('start', function (message) {
        self.main.startLoop();

        self.main.game.on('sendInput' , function (param) {
            self.socket.emit('clientInput',param);
        });

        self.socket.on('game packet', self.socketHandler.bind(self));
    });

    self.socket.emit('join', 'hello');
};

ClientManager.prototype.socketHandler = function (message) {
    var self = this;
    // 여기서 이제 다른 player의 데이터를 동기화 하거나
    // 일단 클라이언트의 입력에 따라 서버에서 처리가 제대로 되는지 파악 해 보자

    if(message.type === 5){
        self.main.game.messages.push(message);
    }
};
