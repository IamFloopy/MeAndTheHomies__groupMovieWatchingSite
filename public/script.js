const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const nickname = document.getElementById("nickname");
const activeGrid = document.getElementById('active-grid')


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

  function displayHide() {
    document.getElementById("showWhenName").style.visibility = "hidden";
  }
  displayHide()

  
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

socket.on('user-disconnected', userId=> {
  /*console.log(nickname.value + " left")
  id_nickname = local_all_users.indexOf(nickname.value) +1
  console.log(id_nickname)
  var el = document.getElementById( id_nickname );
  console.log(el)*/

  if (peers[userId]) peers[userId].close()

})


//get_user_input_name
document.addEventListener("keydown", (e) => {
  if (e.which === 13 && nickname.value != "") {
    socket.emit("nickname", {
      user: nickname.value,
    });
    function displayHide() {
      document.getElementById("pid").style.visibility = "hidden";
   }
    function displayShow() {
      document.getElementById("showWhenName").style.visibility = "visible";
  }
   if (nickname.value != ""){
    displayHide()
    displayShow() 
   }
  }
});

//get_user_input_massage and send it to server.js
document.addEventListener("keydown", (e) => {
  if (e.which === 13 && chatInputBox.value != "") {
    socket.emit("message", {
    msg: chatInputBox.value,
    user: nickname.value,
  });
    chatInputBox.value = "";
  }
});

//receive data from server.js and display it
socket.on("createMessage", (message) => {
  console.log(message);
  let li = document.createElement("li");
  if (message.user != nickname.value) {
    li.classList.add("otherUser");
    li.innerHTML = `<div class="profile-pic">
                    <img src="https://avatars.dicebear.com/api/big-smile/${message.user}.svg"></img>
                    <div><b>${message.user}<br/></b>${message.msg}</div>
                    </div>`;
                    //<img src="https://avatars.dicebear.com/api/big-smile/${message.user}.svg"></img>
  } else {
    li.innerHTML = `<div class="profile-pic">
                    <img src="https://avatars.dicebear.com/api/big-smile/${message.user}.svg"></img>
                    <div><b>Me<br> </b>${message.msg}</div>
                    </div>`;
                    //<img src="https://avatars.dicebear.com/api/big-smile/${message.user}.svg"></img>
  }
  all_messages.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
});


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

var indexInUserList = 0;

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

var index_id = 1;
var id_nickname;
let local_all_users = [];
let nameOf = "NickName";

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  //videoGrid.append(video)
  
  
  socket.on("shownickname", (nickname, all_users) => {
    nameOf = nickname.user;
    console.log(all_users)
    local_all_users = all_users;

    for (var i = 1; i <= index_id; ++i) {
        let idOf = document.getElementById('' + i)
        //removes the "ghosts" (accumulated undefined users due to someone leaving, but the div staying)
        /*if (all_users[i-1] == undefined) {
          idOf.parentNode.removeChild(idOf)
        } else {*/
        idOf.innerHTML = `<div class="face_name id="face_name">
                            <img src="https://avatars.dicebear.com/api/big-smile/${all_users[i-1]}.svg">
                            <div class="jmeno id="jmeno">${all_users[i-1]}</div>
                          </div>
                          `  
        //}
}
  

})
  activeGrid.innerHTML = activeGrid.innerHTML + `<div id="${index_id}">${nameOf}</div>`;
  index_id += 1;
}

//screen_sharing
var screenSharing = false
var screenStream;
var peer = null;

function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}
function setRemoteStream(stream) {

  let video = document.getElementById("remote-video");
  video.srcObject = stream;
  video.play();
}

function startScreenShare() {
  navigator.mediaDevices.getDisplayMedia({ video: true, }).then((stream) => {
      screenStream = stream;
      let videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => {
          stopScreenSharing()
      }

      console.log(screenStream)
      setRemoteStream(stream)
  })
}

//send emoji that was pressed to server.js
function sendEmoji(emoji) {
  socket.emit("emoji", {
    emoji: emoji,
    user: nickname.value
  });
  //console.log(emoji)
}

//receive an emoji from server.js to display
socket.on("displayEmoji", (emoji, user_index) => {
  user_index += 1;
  var picLink;
  function whatPicture() {
    switch (emoji.emoji) {
      case 'monkas':
        picLink = "https://www.streamscheme.com/wp-content/uploads/2020/04/Monkas.png.webp";
        break;
      case 'pepelaugh':
        picLink = "https://www.streamscheme.com/wp-content/uploads/2020/08/pepelaugh-emote.png";
        break;
      case 'monkahmm':
        picLink ="https://www.streamscheme.com/wp-content/uploads/2020/09/monkahmm-emote.png" ;
        break;
      case 'poggers':
        picLink ="https://www.streamscheme.com/wp-content/uploads/2020/04/poggers.png.webp";
        break;
      case 'feelsbadman':
        picLink ="https://www.streamscheme.com/wp-content/uploads/2020/04/feelsbadman.png.webp" ;
        break;
      case 'pepehands':
        picLink ="https://www.streamscheme.com/wp-content/uploads/2020/04/pepehands.png.webp" ;
        break;
      case 'comfy':
        picLink ="https://i.ibb.co/2hsHSD9/comfy.png" ;
        break;
      case 'cutescared':
        picLink ="https://i.ibb.co/Sv8V0PP/cutescared.png";
        break;
      case 'popcorn':
        picLink ="https://i.ibb.co/XCm9nnM/popcorn.png";
        break;
      case 'lovestruck':
        picLink ="https://i.ibb.co/PQWVMcC/lovestruck.png" ;
        break;
      case 'scared':
        picLink ="https://i.ibb.co/HB3bGMV/scared.png";
        break;
      case 'angry':
        picLink ="https://i.ibb.co/Fh64PVZ/angry.png" ;
        break;
      case 'vomit':
        picLink ="https://i.ibb.co/jgr3PnB/vomit.png";
        break;
      case 'heart':
        picLink ="https://www.streamscheme.com/wp-content/uploads/2020/04/twitch-heart.png.webp";
    } //console.log(picLink)
  }
  whatPicture()
  for (var i = 1; i <= index_id; ++i) {
    if (i == user_index) {
    let idOf = document.getElementById('' + i)
    idOf.removeChild(idOf.childNodes[1]);
    idOf.innerHTML += `<div class="displayedEmote">
                        <img src="${picLink}">
                        </div>`  
    }
  }
});