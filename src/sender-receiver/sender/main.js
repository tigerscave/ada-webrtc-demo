'use strict';

const socket = io();

let localStream = null;
let pc = null;    //peer connection
let sendChannel = null;    //for WebRTC data channel

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

const userList = document.getElementById("userList");

/* --- start button related --- */

const gotLocalMediaStream = mediaStream => {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;

  pc = new RTCPeerConnection();
  sendChannel = pc.createDataChannel("dataChannel", null);
  
}

const handleLocalMediaStreamError = () => {
  alert("Error. Can not load media stream.")
}

const onStartButtonPressed = () => {
  console.log("---startButtonPressed---")
  navigator.mediaDevices.getUserMedia({audio: false, video: true})
  .then(gotLocalMediaStream)
  .catch(handleLocalMediaStreamError)
}


/* --- call button related --- */

const handleOnIceCandidate = (event) => {
  const { candidate } = event;
  if(candidate) {
    console.log("---handleOnIceCandidate---")
    const newIceCandidate = new RTCIceCandidate(candidate);
    pc.addIceCandidate(newIceCandidate);
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
  console.log(targetId)
  
  pc.createOffer(offerOptions)
  .then((description) => createOfferSuccess(targetId, description))
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

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', onStartButtonPressed);

const hangUpButton = document.getElementById('hangUpButton');
hangUpButton.addEventListener('click', hanldeOnHangUpButtonClicked);

const reloadButton = document.getElementById("reloadButton");
reloadButton.addEventListener('click', onReloadButtonClicked);

const hogeButton = document.getElementById("hogeButton");
hogeButton.addEventListener('click', onHogeButtonClicked)

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
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    console.log("pc connectionState", pc.connectionState);
  })
})

