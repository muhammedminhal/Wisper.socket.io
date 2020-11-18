var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require("socket.io").listen(http)
var users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


io.sockets.on('connection', (socket) => {
    socket.on("new user", (data, callback) => {

        if (data in users) {
            //    user user object ill undangill error kanikku
            callback(false);
        } else {
            //    illengill ee fnction work chayyum
            callback(true)
            //    socketileek client nne kittiyye data nicknme aayit store aakum for uniqueness
            socket.nickname = data
            users[socket.nickname] = socket;
            console.log("bino",users[socket.nickname])
            updateNickname()
        }
    })

    
    // giving the users object to the client and making it loop through all user object.
    function updateNickname() {
        io.sockets.emit("usernames", Object.keys(users));
        console.log("users:", Object.keys(users))
    }

    socket.on('send message', (data, callback) => {
        var msg = data.trim()
        if (msg.substr(0, 3) === '/w ') {
            var msg = msg.substr(3);
            var ind = msg.indexOf(' ');

            if (ind !== -1) {
                var name = msg.substring(0, ind)
                var msg = msg.substring(ind + 1)
                if (name in users) {
                    users[name].emit('whisper', { msg: msg, nick: socket.nickname })
                    console.log("wisper")
                } else {
                    callback("enter valid user")
                }
            } else {
                //   callbak error
                callback('error please enter a msg')
            }
        } else {
            io.sockets.emit('new message', { msg: msg, nick: socket.nickname })
        }
    })
    socket.on('disconnect', (data) => {
        if (!socket.nickname) return;
        delete users[socket.nickname]
        updateNickname()
    })
})

http.listen(8000, () => {
    console.log('user conected on port 8000')
})