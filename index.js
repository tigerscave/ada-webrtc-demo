const express = require("express");
const http = require("http");
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5355;
const app = express();
app.use(express.static("src"));

const server = http.createServer(app)

const io = require("socket.io")(server);

const STOP_THRESHOLD = 0.2;

const main = () => {
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

  const handleIceCandidate = (socket, data) => {
    const { candidate, calleeId } = data;
    socket.to(calleeId).emit(
      "new-ice-candidate",
      candidate
    );
  }

  const handleRefreshOffer = (socket, id) => {
    socket.to(id).emit("refreshPeerConnection")
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

    socket.on('new-ice-candidate', data => {
      handleIceCandidate(socket, data)
    })

    socket.on('refreshOffer', id => {
      handleRefreshOffer(socket, id)
    })
  });
}

main();