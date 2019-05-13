'use strict';

const socket = io();

let localStream = null;
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
  console.log(pc.getSenders())

  // this event is called when iceConnectionState changed
  pc.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange)

  pc.addEventListener('negotiationneeded', handleNegotiationNeededEvent)

  pc.addEventListener('signalingstatechange', handleSignalingStateChangeEvent)

  pc.addEventListener("icecandidate", handleOnIceCandidate);
}

const userList = document.getElementById("userList");

/* --- start button related --- */

const gotLocalMediaStream = mediaStream => {
  console.log(mediaStream)
  document.getElementById("localVideo1").srcObject = mediaStream;
  localStream = mediaStream;
}

const handleLocalMediaStreamError = () => {
  alert("Error. Can not load media stream.")
}

const gotLocalVideoStream = (mediaStream, videoEl) => {
  videoEl.srcObject = mediaStream;
  mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));
}

const onStreamVideoButtonClicked = (deviceId, index) => {
  const videoEl = document.getElementById(`localVideo${index+1}`);
  navigator.mediaDevices.getUserMedia(
    {
      audio: false,
      video: {deviceId}}
  )
  .then((mediaStream) => gotLocalVideoStream(mediaStream, videoEl))
}

const displayDeviceList = devices => {
  const deviceListEl = document.getElementById("deviceList");
  while (deviceListEl.firstChild) {
    deviceListEl.removeChild(deviceListEl.firstChild);
  }
  devices.forEach((device, index) => {
    const listNode = document.createElement("LI");
    const textNode = document.createTextNode(device.label);
    listNode.appendChild(textNode);

    // add call button to each user
    const buttonNode = document.createElement("BUTTON");
    buttonNode.appendChild(document.createTextNode("STREAM VIDEO"));
    buttonNode.value = device.deviceId;
    buttonNode.addEventListener("click", () => onStreamVideoButtonClicked(device.deviceId, index));
    listNode.appendChild(buttonNode);

    deviceListEl.appendChild(listNode);
  })
}

const onDeviceListButtonClicked = () => {
  const videoDevices = [];
  navigator.mediaDevices.enumerateDevices()
  .then((devices) => {
    console.log(devices)
    devices.forEach((device) => {
      if(device.kind === 'videoinput') {
        videoDevices.push(device);
      }
    })
    console.log(videoDevices)
    displayDeviceList(videoDevices)
  })
}

const onStartButtonPressed = () => {
  console.log("---startButtonPressed---")
  console.log(navigator.mediaDevices)
  navigator.mediaDevices.getUserMedia(
    {
      audio: false,
      video: true}
  )
  .then(gotLocalMediaStream)
  .catch(handleLocalMediaStreamError)
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

const onCallButtonClicked = (targetId) => {
  calleeId = targetId;
  createPeerConnection();

  pc.createOffer(offerOptions)
  .then((description) => createOfferSuccess(calleeId, description))

  //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  // this fires negotiationneeded event
  //sendChannel = pc.createDataChannel("dataChannel", null);
  //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // pc.createOffer(offerOptions)
  // .then((description) => createOfferSuccess(targetId, description))
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

const onSendStreamButtonClicked = () => {
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
}


/* --- event listeners --- */

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', onStartButtonPressed);

const deviceList = document.getElementById('deviceListButton');
deviceList.addEventListener('click', onDeviceListButtonClicked)

const hangUpButton = document.getElementById('hangUpButton');
hangUpButton.addEventListener('click', hanldeOnHangUpButtonClicked);

const reloadButton = document.getElementById("reloadButton");
reloadButton.addEventListener('click', onReloadButtonClicked);

const hogeButton = document.getElementById("hogeButton");
hogeButton.addEventListener('click', onHogeButtonClicked)

const sendStreamButton = document.getElementById("sendStream");
sendStreamButton.addEventListener('click', onSendStreamButtonClicked);

/* --- socket listeners --- */
socket.on('connect', () => {
  document.getElementById('socketId').innerText = socket.id;
});

socket.on('userList', users => {
  const otherUsers = users.filter(id => id !== socket.id);
  
  otherUsers.map(id => {
    const listNode = document.createElement("LI");
    const textNode = document.createTextNode(id);
    listNode.appendChild(textNode);

    // add call button to each user
    const buttonNode = document.createElement("BUTTON");
    buttonNode.appendChild(document.createTextNode("CALL"));
    buttonNode.value = id;
    buttonNode.addEventListener("click", () => onCallButtonClicked(id));
    listNode.appendChild(buttonNode);

    userList.appendChild(listNode);
  })
})

socket.on("answerToSender", description => {
  console.log("---socket.on answerToSender---")
  pc.addEventListener(
    "icecandidate",
    handleOnIceCandidate
  );
  pc.setRemoteDescription(description).then(() => {
    console.warn("---setRemoteDescription---")
    console.log(pc)
    console.log(pc.getSenders())
    console.log(pc.signalingState)
    //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    //if(pc.getSenders().length === 0) {
      //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    //}
    console.log("pc connectionState", pc.connectionState);
  })
})

