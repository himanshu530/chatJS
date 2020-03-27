const socket = io();
const chatForm  = document.getElementById('chat-form');
const chatMessages= document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
});

socket.emit('joinRoom', {username,room});

//Get room and users info
socket.on('roomUsers', ({room,users})=>{
    outputRoomName(room);
    outputRoomUsers(users);
});

//message from server
socket.on('message',(message) =>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;


    
});


//Message Submit

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    
    const msg = e.target.elements.msg.value;
    //submitting a message to the server
    socket.emit('chatMessage', msg);

    //clearing the input;
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output message to the dom

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;

}

function outputRoomUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}