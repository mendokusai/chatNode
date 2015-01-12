var cors = require('cors');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(config.port, function () {
    console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

app.use( cors() );

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.set('transports', [
    	'websocket',
    	'flashsocket',
    	'htmlfile', 
    	'xhr-polling',
    	'jsonp-polling'
    ]);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://yaps.herokuapp.com');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);



// var url = "/";

app.get("http://yaps.herokuapp.com", function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
});

// // // broadcast to all
// // io.emit('some event', { for: 'everyone' });

// // // broadcast to everyone except for certain socket
// // io.on('connection', function(socket){
// // 	socket.broadcast.emit('hi');
// // });

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

// // http.listen(3001, function(){
// //   console.log('listening on *:3001');
// // });


// http.listen(url, function(){
//   console.log('listening to' + url);
// });

// // io.connect('http://yaps.herokuapp.com');
