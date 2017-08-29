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
  self.main = new Main(self.socket.id);
};

ClientManager.prototype.setupSocket = function(){
  var self = this;

  self.socket.on('connect_failed', function() {
    self.socket.close();
    console.log('connect_failed');
  });

  self.socket.on('game packet', self.socketHandler.bind(self));
  self.socket.on('room_id', function(message){
    console.log('room_id : ' + message);
  });

  self.socket.emit('join', 'hello');

  self.main.startGame();
};

ClientManager.prototype.socketHandler = function(message){
  var self = this;
  console.log(message);
};
