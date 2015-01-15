var cors = require('cors');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
// var redis = require('redis-node'); //https://github.com/bnoguchi/redis-node

// var client = redis.createClient();


var mainURL, nodeURL, whitelist;

var env = process.env.NODE_ENV || 'development'
if (env === 'development') {
    nodeURL = 'http://localhost:3002',
    mainURL = 'http://localhost:3000',
    whitelist = [mainURL, nodeURL, mainURL, nodeURL];
} else{
    nodeURL = 'http://yapsnode.herokuapp.com',
    mainURL = 'http://yaps.herokuapp.com',
    whitelist = [mainURL, nodeURL, mainURL, nodeURL];
};


// http.listen(80);
http.listen(process.env.PORT || 3001, function () {
    console.log('Express server listening on port %d in %s mode', env.mainURL, app.get('env'));
});

// app.use( cors() );

app.listen(8888, function(){
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
    res.header('Access-Control-Allow-Origin', mainURL);
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



var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

var url = "/";

app.get(url, cors(corsOptions), function(req, res){
  res.sendfile('index.html');
});
var allUSERS =[],
    socket_username,
    socket_room;


function logout(user, allUSERS){
    var user_index = allUSERS.indexOf(user);
    if (user_index > -1){
        allUSERS.splice(user_index, 1);
    };
    return allUSERS;
}
//on connection, get data
io.on('connection', function(socket){
    

    socket.on('change room', function(change_room){
        socket_room = change_room.room;
        console.log("Changeroom data: " + change_room[0] + change_room[1]);
        socket.join(change_room.room);
        msg = {
            stamp: new Date().toLocaleTimeString(),
            socket_room: socket_room,
            name: change_room.name,
            url: "none",
            image: "none",
            text: "has moved to " + change_room.room
        }
        io.emit('chat message room change', msg);
        socket.emit('room details', change_room);
    });

    socket.on('user config', function(data){
        socket_username = data.username;
        // console.log(socket.id + ":" + socket.username);
        // console.log(allUSERS);
        allUSERS.push(socket_username);
        // console.log("\n\n\n\nTEST", allUSERS, "\n\n\n\n");
        // console.log("Username: " + username);
        msg = {
            stamp: new Date().toLocaleTimeString(),
            name: socket_username,
            url: "none",
            image: "none",
            text: "has entered the chat."
        }
        io.emit('chat message', msg);
        io.emit('all users', allUSERS);
    });
// connection message send
	console.log('a user connected' + new Date().toLocaleString());
    socket.on('disconnect', function(msg){
        msg = {
        stamp: new Date().toLocaleTimeString(),
        name: socket_username,
        url: "none",
        image: "none",
        text: "has left the chatroom."
        }
        logout(socket_username, allUSERS);
        console.log("allUsers: " + allUSERS);
		io.emit('chat message', msg);
        io.emit('user disconnected', msg);
        io.emit('all users', allUSERS);

	});

// post message to lobby
    socket.on('chat message', function(msg){
        console.log('Post At: ' + msg.date + ' User: ' + msg.name + ' Text: ' + msg.text);
        msg.name = msg.name;
        msg.text = _.escape(msg.text);
        io.emit('chat message', msg);
    });

// post message to user room
    socket.on('chat message', function(msg){
        console.log('Post At: ' + msg.date + ' User: ' + msg.name + ' Text: ' + msg.text);
        msg.name = msg.name;
        msg.text = _.escape(msg.text);
        io.to(socket_room).emit('chat message', msg);
    });

    socket.on('chat message in room', function (msg) {
        console.log('\n\nPost At: ' + msg.date + '\n User: ' + msg.name + '\n Text: ' + msg.text + '\n Room: ' + msg.socket_room + "\n\n");
        msg.name = msg.name;
        msg.text = _.escape(msg.text);
        io.to(socket_room).emit('chat message', msg);
    });

//at enter
// broadcast to everyone except for certain socket *this doesn't work!

    // msg = {
    //     stamp: new Date().toLocaleTimeString(),
    //     name: socket.username,
    //     url: "none",
    //     image: "none",
    //     text: "has entered the arena."
    // }

    // console.log("\n\n\n\nTEST", msg.name, "\n\n\n\n");


    //socket.broadcast
    // io.emit('chat message', msg);

//this is posting the message
    socket.on('chat message', function(msg){
        console.log('Post At: ' + msg.date + ' User: ' + msg.name + ' Text: ' + msg.text);
    });
});

// // // broadcast to all
// // io.emit('some event', { for: 'everyone' });





