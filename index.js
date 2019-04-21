const express = require("express");
const http = require("http");
const PORT = process.env.PORT || 5355;
const app = express();
app.use(express.static("src"));
const server = http.createServer(app);
const io = require("socket.io")(server);


server.listen(PORT, () => {
  console.log("listening on PORT :", PORT);
});

let users = [];

const addUser = socket => {
  users.push(socket.id);
  console.log("---user added---")
  console.log(users);
};

const removeUser = socket => {
  users = users.filter(user => user !== socket.id);
  console.log(`socket id ${socket.id} is removed.`);
};

const handleReloadUsers = socket => {
  socket.emit("userList", users);
}

const handleOfferFromSender = (socket, data) => {
  const { description, userId } = data;
  socket.to(userId).emit("offerToReceiver", {
    description,
    senderId: socket.id
  })
}

const handleAnswerFromReceiver = (socket, data) => {
  const { description, senderId } = data;
  socket.to(senderId).emit(
    "answerToSender",
    description
  );
}

io.on("connection", socket => {
  console.log('new user connected');
  addUser(socket);

  socket.on('disconnect', () => {
    removeUser(socket);
  });

  socket.on('reloadUsers', () => {
    handleReloadUsers(socket)
  });

  socket.on('offerFromSender', data => {
    handleOfferFromSender(socket, data);
  });

  socket.on('answerFromReceiver', data => {
    handleAnswerFromReceiver(socket, data);
  });
});
