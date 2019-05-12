'use strict';

const socket = io();

let pc = new RTCPeerConnection();    //peer connection

const handleMessageReceived = event => {
  const { data } = event;
  console.log("data from sender :", data);
};

const handleOnDataChannel = event => {
  const { channel } = event;
  channel.addEventListener("message", handleMessageReceived);
};

const handleOnTrackConnection = (event) => {
  console.log("---handleOnTrackConnection---");
  console.log(event)
  console.log(event.streams[0].getTracks())
  document.getElementById("remoteVideo").srcObject = event.streams[0];
}

const createdAnswer = (senderId, description) => {
  console.log("---createdAnswer---");
  pc.addEventListener(
    "icecandidate",
    handleOnIceCandidate
  );
  pc.setLocalDescription(description).then(() => {
    pc.addEventListener('track', handleOnTrackConnection);
    pc.addEventListener("datachannel", handleOnDataChannel);
    socket.emit("answerFromReceiver", {
      description,
      senderId
    });

    console.log("pc", pc.connectionState);
  })
}

const handleOnIceCandidate = (event) => {
  const { candidate } = event;
  if(candidate) {
    console.log("---handleOnLocalIceCandidate---")
    const newIceCandidate = new RTCIceCandidate(candidate);
    pc.addIceCandidate(newIceCandidate);
  }
}

/* --- socket listeners --- */
socket.on('connect', () => {
  document.getElementById('socketId').innerText = socket.id;
});

socket.on('offerToReceiver', data => {
  const { description, senderId } = data;

  pc.setRemoteDescription(description).then(() => {
    pc
      .createAnswer()
      .then(description => createdAnswer(senderId, description));
  });
})

const handleNewICECandidate = data => {
  console.log("---handleNewICECandidate---")
  const candidate = new RTCIceCandidate(data);
  pc.addIceCandidate(candidate);
};

socket.on('new-ice-candidate', candidate => {
  handleNewICECandidate(candidate)
});