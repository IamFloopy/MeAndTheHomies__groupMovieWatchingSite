const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

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

      io.to(roomId).emit("shownickname", nickname, all_users);
    });

    //receive data from script.js
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on('disconnect', () => {
      
      var indOf = userId_list.indexOf(userId)
      //console.log(indOf)
      all_users.splice(indOf, 1)
      userId_list.splice(indOf, 1)
      //console.log(all_users)

      socket.to(roomId).broadcast.emit('user-disconnected', userId)

    })
  })
})

server.listen(3000)