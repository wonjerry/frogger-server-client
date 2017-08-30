var SocketIO = require('socket.io-client');
var Main = require('./main');
window.onload = function(){
  new ClientManager();
};

function ClientManager(){
  var self = this;
  if (!(self instanceof ClientManager)) return new ClientManager();
  self.init();
}

ClientManager.prototype.init = function(){
  var self = this;

  self.socket = SocketIO(window.location.hostname + ':' + window.location.port);
  self.setupSocket();
};

ClientManager.prototype.setupSocket = function(){
  var self = this;

  self.socket.on('connect_failed', function() {
    self.socket.close();
    console.log('connect_failed');
  });

  self.socket.on('game packet', self.socketHandler.bind(self));

  self.socket.on('welcome', function(message){
    self.main = new Main({ id : self.socket.id , seed : message.seed });
    self.main.startGame();
  });

  self.socket.emit('join', 'hello');
};

ClientManager.prototype.socketHandler = function(message){
  var self = this;
  // 여기서 이제 다른 player의 데이터를 동기화 하거나
  //
  console.log(message.message);
};
