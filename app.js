const express = require('express');
const app = express();

const path = require('path');
const http = require('http').createServer(app);

const { Server } = require('socket.io');
const io = new Server(http);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js', {
    headers: {
      'Content-Type': 'application/javascript'
    }
  });
});

io.on("connection", (socket) => {
  socket.emit('request-username');

  socket.on("send-username", (username) => {
    console.log(username);
    socket.data.username = username;
  });
  socket.on("send-location", (data) => {
    io.emit("recieve-location", { id: socket.id, username: socket.data.username, ...data });
  });
  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
  })
});

app.get('/', (req, res) => {
  res.render('index');
})

http.listen(3000, () => {
  console.log("connected to port 3000");
})