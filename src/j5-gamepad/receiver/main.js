'use strict';

const socket = io();

let pc = new RTCPeerConnection();    //peer connection
let sendChannel = null;    //for WebRTC data channel

const handleMessageReceived = event => {
  const { data } = event;
  console.log("data from sender :", data);
};

const handleOnDataChannel = event => {
  const { channel } = event;
  channel.addEventListener("message", handleMessageReceived);
};

const handleIceConnectionStateChange = event => {
  console.warn("iceconnectionstatechange fired")
  console.log("iceConnectionState:", pc.iceConnectionState);
  console.log("connectionState:", pc.connectionState);
}

const showRemoteVideos = streams => {
  streams.forEach((stream, index) => {
    if(index < 3) {
      const videoEl = document.getElementById(`remoteVideo${index+1}`);
      videoEl.srcObject = stream;
    }
  })
}

const handleSignalingStateChangeEvent = () => {
  console.warn("signalingstatechange fired")
  console.log("signalingState:", pc.signalingState)
  console.log("connectionState:", pc.connectionState);
  console.log(pc.getRemoteStreams())
  console.log(pc.getRemoteStreams()[0].getVideoTracks())
  console.log(pc.getRemoteStreams()[0].getVideoTracks()[0].getSettings())
  if(pc.getRemoteStreams().length > 0) {
    showRemoteVideos(pc.getRemoteStreams())
  }
}

const handleOnTrackConnection = (event) => {
  console.warn("---handleOnTrackConnection---");
  console.log(event)
  console.log(event.streams)
}
  

const handleConnectionChange = (event) => {
  console.warn("connectionstatechange fired")
  console.log("signalingState:", pc.signalingState)
  console.log("connectionState:", pc.connectionState);
}

pc.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange)
pc.addEventListener('signalingstatechange', handleSignalingStateChangeEvent)
pc.addEventListener('connectionstatechange', handleConnectionChange)

const createdAnswer = (senderId, description) => {
  console.log("---createdAnswer---");
  sendChannel = pc.createDataChannel("dataChannel", null);
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