const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const nickname = document.getElementById("nickname");

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})



document.addEventListener("keydown", (e) => {
  if (e.which === 13 && nickname.value != "") {
    console.log(nickname.value);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.which === 13 && chatInputBox.value != "") {
    socket.emit("message", {
    msg: chatInputBox.value,
    user: nickname.value,
  });
    chatInputBox.value = "";
  }
});

socket.on("createMessage", (message) => {
  console.log(message);
  let li = document.createElement("li");
  if (message.user != nickname.value) {
    li.classList.add("otherUser");
    li.innerHTML = `<div><b><small>${message.user}</small>: </b>${message.msg}</div>`;
    console.log(message.user)
    console.log(nickname.value)
  } else {
    li.innerHTML = `<div><b>Me: </b>${message.msg}</div>`;
  }
  all_messages.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
});


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

