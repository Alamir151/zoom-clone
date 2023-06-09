

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers={}
const peer = new Peer(undefined, {
  host: 'zoomero.onrender.com',
  secure: true,
  path: '/peerjs',

  port: '443',
});

const socket = io();

let myVideoStream;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  socket.on('user-connected', userId => {
    console.log('New user connected: ' + userId);
    connectToNewUser(userId, stream);
  });

  peer.on('call', (call) => {
    console.log('Receiving call');
    call.answer(stream);
    const video = document.createElement('video');
    call.on('answer', userVideoStream => {
      console.log('Adding new user');
      addVideoStream(video, userVideoStream);
    });
  });




});

socket.on('user-disconnected', userId => {
  console.log('user disconnected');
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})





const connectToNewUser = (userId, stream) => {
  console.log('Connecting to new user: ' + userId + stream);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on("stream", userVideoStream => {
    console.log('Adding new user');
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
  });
  peers[userId] = call;



}


const addVideoStream = (video, stream) => {
  console.log('Adding local video stream');
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

let text = $('input');

$('html').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    console.log(ROOM_ID);
    socket.emit('message', text.val());
    text.val('');
  }
});
socket.on('createMessage', (message) => {
  $('.messages').append(`<li class="message"><b>User </>${message}</li>`);
  scrollToBottom();
})
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})
const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}
const playStop = () => {

  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

function setMuteButton() {
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
  document.querySelector('.main__mute_button').innerHTML = html;
}

function setUnmuteButton() {
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
  document.querySelector('.main__mute_button').innerHTML = html;
}
function setStopVideo() {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
  document.querySelector('.main__video_button').innerHTML = html;
}

function setPlayVideo() {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
  document.querySelector('.main__video_button').innerHTML = html;
}


