var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use('/', express.static(path.join(__dirname, './../client')));

io.on('connection', function(socket) {
  console.log('hihi');
});


http.listen(3000,'127.0.0.1', function() {
  console.log('[DEBUG] Listening on 127.0.0.1 : 3000');
});
