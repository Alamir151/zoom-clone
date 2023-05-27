const express = require('express');
const app = express();
app.enable('trust proxy');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const server = require('http').Server(app);
const cors = require('cors');

const io = require("socket.io")(server

);
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peerjs', peerServer);
app.use(cors());

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:roomID', (req, res) => {
  res.render('room', { roomId: req.params.roomID });
});

io.on('connection', socket => {
  console.log('connection');
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      console.log(`message comming from server ${message}`);
      io.to(roomId).emit('createMessage', message)
    });
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    });


  });

})



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});