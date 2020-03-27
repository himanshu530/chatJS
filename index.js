const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const server = http.createServer(app);
//set static foleder

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const formatMessage = require('./utils/messages');
app.use(express.static(path.join(__dirname,'public')));

const botName = 'All Nighter Bot';
const io = socketio(server);
const port = process.env.port || 3000;

//Run this when client connects;
io.on('connection', (socket) =>{

    socket.on('joinRoom', ({username,room}) => {
    const user = userJoin(socket.id,username,room);
    socket.join(user.room);
        //welcome a new user
    socket.emit('message',formatMessage(botName,'Welcome to All Nighter Chat Room'));

    //broadcast when a user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} joined the chat`));

    //Send users and room info to main.js
    io.to(user.room).emit('roomUsers',{
        room : user.room,
        users : getRoomUsers(user.room)
    });

    });

    
    //Listen for the message emitted by the client
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    
    //run when client disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} left the chat`));

        //Send users and room info to main.js
    io.to(user.room).emit('roomUsers',{
        room : user.room,
        users : getRoomUsers(user.room)
    });
    
        }

        
    });
} );


server.listen(port, ()=>{
    console.log(`Server running on ${port}`);
});