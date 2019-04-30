'use strict';

const socket = io();

let pc = null;    //peer connection
let sendChannel = null;    //for WebRTC data channel
let calleeId = "";

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

const handleNegotiationNeededEvent = () => {
  console.warn("negotiationneeded fired")
  pc.createOffer(offerOptions)
  .then((description) => createOfferSuccess(calleeId, description))
}

const handleIceConnectionStateChange = event => {
  console.warn("iceconnectionstatechange fired")
  console.log("iceConnectionState:", pc.iceConnectionState);
  console.log("connectionState:", pc.connectionState);
}

const handleSignalingStateChangeEvent = () => {
  console.warn("signalingstatechange fired")
  console.log("signalingState:", pc.signalingState)
  console.log("connectionState:", pc.connectionState);
}

const createPeerConnection = () => {
  pc = new RTCPeerConnection();
  console.warn("createPeerConnection")
  console.log("connectionState:", pc.connectionState);

  // this event is called when iceConnectionState changed
  pc.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange)

  pc.addEventListener('negotiationneeded', handleNegotiationNeededEvent)

  pc.addEventListener('signalingstatechange', handleSignalingStateChangeEvent)

  pc.addEventListener("icecandidate", handleOnIceCandidate);
}

/* --- call button related --- */

const handleOnIceCandidate = (event) => {
  const { candidate } = event;

  if(candidate) {
    socket.emit("new-ice-candidate", {
      calleeId,
      candidate
    })
  }
}

const createOfferSuccess = (targetId, description) => {
  pc.setLocalDescription(description)
  .then(() => {
    socket.emit("offerFromSender", {
      description,
      userId: targetId
    })
  })

}

const onCallButtonClicked = () => {
  createPeerConnection();

  // this fires negotiationneeded event
  sendChannel = pc.createDataChannel("dataChannel", null);

  calleeId = document.getElementById('targetId').value;
}

/* --- hang up button related --- */

const hanldeOnHangUpButtonClicked = () => {
  pc.close();
  pc = null;
}

/* -- reload button related --- */

const onReloadButtonClicked = () => {
  while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
  }
  socket.emit("reloadUsers");
}

const onHogeButtonClicked = () => {
  sendChannel.send("HOGE");
}


/* --- event listeners --- */

const hangUpButton = document.getElementById('hangUpButton');
hangUpButton.addEventListener('click', hanldeOnHangUpButtonClicked);

const hogeButton = document.getElementById("hogeButton");
hogeButton.addEventListener('click', onHogeButtonClicked)

const callButton = document.getElementById('callButton');
callButton.addEventListener('click', onCallButtonClicked);

/* --- when get call from other peer --- */

const handleMessageReceived = event => {
  const { data } = event;
  console.log("data from sender :", data);
};

const handleOnDataChannel = event => {
  const { channel } = event;
  channel.addEventListener("message", handleMessageReceived);
};

const createdAnswer = (senderId, description) => {
  pc.setLocalDescription(description).then(() => {
    pc.addEventListener("datachannel", handleOnDataChannel);
    socket.emit("answerFromReceiver", {
      description,
      senderId
    });

    console.warn("setLocalDescription success")
    console.log("connectionState:", pc.connectionState);
  })
}

const handleNewICECandidate = data => {
  const candidate = new RTCIceCandidate(data);
  pc.addIceCandidate(candidate);
}

/* --- socket listeners --- */
socket.on('connect', () => {
  document.getElementById('socketId').innerText = socket.id;
});

socket.on("answerToSender", description => {
  pc.setRemoteDescription(description).then(() => {
    console.warn("setRemoteDescription success")
    console.log("connectionState:", pc.connectionState);
  })
})

socket.on('offerToReceiver', data => {
  createPeerConnection()
  const { description, senderId } = data;

  pc.setRemoteDescription(description).then(() => {
    pc
      .createAnswer()
      .then(description => createdAnswer(senderId, description));
  });
})

socket.on('new-ice-candidate', candidate => {
  handleNewICECandidate(candidate)
})
