const express = require("express");
const http = require("http");
const https = require('https');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5355;
const app = express();
app.use(express.static("src"));
const certificateOptions = {
  key: fs.readFileSync(path.resolve('./cert/server.key')),
  cert: fs.readFileSync(path.resolve('./cert/server.crt'))
}

const server = https.createServer(certificateOptions, app)

const io = require("socket.io")(server);
//var five = require("johnny-five");
//const board = new five.Board();

const STOP_THRESHOLD = 0.2;

const main = () => {
  // var configs = five.Motor.SHIELD_CONFIGS.SEEED_STUDIO;
  // var leftMotor = new five.Motor(configs.B);
  // var rightMotor = new five.Motor(configs.A);

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

  const convert = x => {
    return parseInt(100 * Math.abs(x) + 100)
  }

  const moveLeftMotor = ly => {
    if(ly < STOP_THRESHOLD && ly > STOP_THRESHOLD * -1) {
      leftMotor.stop()
    } else if (ly > STOP_THRESHOLD) {
      leftMotor.forward(convert(ly));
    } else if (ly < STOP_THRESHOLD * -1) {
      leftMotor.reverse(convert(ly));
    }
  }

  const moveRightMotor = ry => {
    if(ry < STOP_THRESHOLD && ry > STOP_THRESHOLD * -1) {
      rightMotor.stop()
    } else if (ry > STOP_THRESHOLD) {
      rightMotor.forward(convert(ry));
    } else if (ry < STOP_THRESHOLD * -1) {
      rightMotor.reverse(convert(ry));
    }
  }

  const handleJoyStickLY = data => {
    moveLeftMotor(data)
  }

  const handleJoyStickRY = data => {
    moveRightMotor(data * -1)
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

    socket.on("joystickLY", data => handleJoyStickLY(data))
    socket.on("joystickRY", data => handleJoyStickRY(data))

  });
}

main();

// board.on("ready", () => {
//   main();
// });