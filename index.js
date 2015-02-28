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

http.listen(process.env.PORT || 3001, function () {
    console.log('Express server listening on port %d in %s mode', env.mainURL, app.get('env'));
});

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




var allUSERS ={},
    rooms = {},
    socket_username,
    socket_room,
    random_chat = [],
    room;

function randomRoom() {
    var room = Math.floor(Math.random() * 200);
    return room;
}

function add_room_person(room, person, rooms) {
    if (rooms.hasOwnProperty(room)){
        rooms[room].push(person);
    } else {
        rooms[room] = [person];
    }
    console.log(rooms);
}

function remove_from_rooms(name, rooms){
            console.log('name', name);
            var room_list = [];
            //first get all rooms
            for (var key in rooms){
                if (rooms.hasOwnProperty(key)){
                    console.log("key:", key);
                    room_list.push(key);
                }
            }
            console.log('roomlist:', room_list);
            //go through rooms[room_list], 
            //  index guy, remove guy
            for (var i = 0; i < room_list.length; i++){
                var index;
                index = rooms[room_list[i]].indexOf(name);
                console.log('index: ', index);
                if (index > -1){
                    console.log("index loc: ",rooms[room_list[i]][index]);
                    rooms[room_list[i]].splice(index, 1);
                }
            }
        }








//on connection, get data
io.on('connection', function(socket){
    socket_room = "lobby";
    socket.join(socket_room);
    var msg;

    socket.on('user config', function(data){
        console.log("User Data received!", data.username);
        socket_username = data.username;
        allUSERS[socket.id] = {}
        allUSERS[socket.id].username = socket_username;
        add_room_person(socket_room, data.username, rooms);
        console.log("All Users: ", allUSERS);
        msg = {
            stamp: new Date().toLocaleTimeString(),
            name: socket_username,
            text: "has entered the chat."
        }
        io.to(socket_room).emit('chat message room change', msg);

        botmsg = {
            stamp: new Date().toLocaleTimeString(),
            name: "YapsBot",
            url: "none",
            image: "none",
            text: 'if you need help type "/help" to see your options.'
        }
        socket.emit('chat message room change', botmsg);
        io.to(socket_room).emit('all users', rooms[socket_room]);
    });
    

    socket.on('random chat', function(data){

        do {
            if (random_chat.length === 3){
                random_chat = [];
            } 
            if (random_chat.length == 0){
                room = randomRoom();
            }
            if (random_chat.length <= 2){
                random_chat.push(data.username);

                socket_room = randomRoom;
                socket.join(socket_room);
                
                change_room = {
                    room: socket_room,
                    name: data.username
                };
                msg = {
                    stamp: new Date().toLocaleTimeString(),
                    socket_room: socket_room,
                    name: data.username,
                    url: "none",
                    image: "none",
                    text: "Welcome to Random Chat!"
                    };

                io.to(socket_room).emit('chat message room change', msg);
                socket.emit('room details', change_room);
            };

        } while (random_chat <= 3);

    });

    socket.on('change room', function(change_room){
        socket_room = change_room.room;
        add_room_person(change_room.room, change_room.name, rooms);
        socket.join(socket_room);
        msg = {
            stamp: new Date().toLocaleTimeString(),
            socket_room: socket_room,
            name: change_room.name,
            text: "has left the room."
        }
        io.to(change_room.last_room).emit('chat message room change', msg);
        socket.emit('room details', socket_room);
        msg.text = "has entered the chat."
        io.to(socket_room).emit('all users', rooms[socket_room]);
        io.to(socket_room).emit('chat message room change', msg);
    });


// connection message send
	console.log('a user connected' + new Date().toLocaleTimeString());
    

    socket.on('disconnect', function(msg){
        console.log ('this person disconnected:', allUSERS[socket.id]);
        msg = {
        stamp: new Date().toLocaleTimeString(),
        name: socket_username,
        url: "none",
        image: "none",
        text: "has left the chatroom."
        }
        // logout(socket.id, allUSERS);
        
        console.log('removing', allUSERS[socket.id].username);
        remove_from_rooms(allUSERS[socket.id].username, rooms);
        delete allUSERS[socket.id];
        console.log(rooms);
        

		io.emit('chat message', msg);
        io.emit('user disconnected', msg);
        io.emit('all users', rooms[socket_room]);

	});


// post message to user room
    socket.on('chat message', function(msg){
        console.log('Post At: ' + msg.date + ' User: ' + msg.name + ' Text: ' + msg.text);
        msg.name = msg.name;
        msg.text = _.escape(msg.text);
        io.in("lobby").emit('chat message', msg);
    });

    socket.on('chat message in room', function (msg) {
        console.log('\n\nPost At: ' + msg.date + '\n User: ' + msg.name + '\n Text: ' + msg.text + '\n Room: ' + msg.socket_room + "\n\n");
        msg.name = msg.name;
        msg.text = _.escape(msg.text);
        io.to(socket_room).emit('chat message', msg);
    });


});




