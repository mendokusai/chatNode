var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// var username = confirm("Username?");

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
  	console.log('message: ' + msg);
  });
});

// // broadcast to all
// io.emit('some event', { for: 'everyone' });

// // broadcast to everyone except for certain socket
// io.on('connection', function(socket){
// 	socket.broadcast.emit('hi');
// });

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});


http.listen(3001, function(){
  console.log('listening on *:3001');
});