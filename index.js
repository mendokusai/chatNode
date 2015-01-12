var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function () {
  app.use(allowCrossDomain);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// var username = confirm("Username?");
var url = "http://yaps.herokuapp.com/"

app.get(url, function(req, res){
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

// http.listen(3001, function(){
//   console.log('listening on *:3001');
// });


http.listen(url, function(){
  console.log('listening to' + url);
});