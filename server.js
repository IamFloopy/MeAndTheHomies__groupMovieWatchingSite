const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  //res.redirect(`/${uuidV4()}`)
  res.redirect(`meandthehomies`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

//all_users have the names of people inside
//userId_list includes userIds position corelates to position of names in all_users
let all_users = [];
let userId_list = [];

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)


    //receive nickname
    socket.on("nickname", (nickname) => {
      all_users.push(nickname.user)
      userId_list.push(userId)
      /*userId_list = [...new Set(userId_list)];
      all_users = [...new Set(all_users)];*/
      io.to(roomId).emit("shownickname", nickname, all_users);
    });

    //receive data from script.js
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("emoji", (emoji) => { 
      let user_index = all_users.indexOf(emoji.user)
      io.to(roomId).emit("displayEmoji", emoji, user_index);
    });

    socket.on("link", (link) => { 
      io.to(roomId).emit("displayVid", link);
    });

    socket.on('disconnect', () => {
      var indOf = userId_list.indexOf(userId)
      //console.log(indOf)
      all_users.splice(indOf, 1)
      userId_list.splice(indOf, 1)
      /*console.log(all_users)
      console.log(userId_list)*/
      
      socket.to(roomId).broadcast.emit('user-disconnected', userId)

    })
  })
})

server.listen(process.env.PORT||3000)