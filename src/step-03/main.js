'use strict';

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream = null;
let pc1 = null;
let pc2 = null;

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

const handleLocalMediaStreamError = () => {
  alert("Error. Can not load media stream.")
}

const gotLocalMediaStream = mediaStream => {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
}

const onStartButtonPressed = () => {
  console.log("---startButtonPressed---")
  navigator.mediaDevices.getUserMedia({audio: false, video: true})
  .then(gotLocalMediaStream)
  .catch(handleLocalMediaStreamError)
}

const startButton = document.getElementById('startButton');

startButton.addEventListener('click', onStartButtonPressed);

const handleOnLocalIceCandidate = (event) => {
  const { candidate } = event;
  if(candidate) {
    console.log("---handleOnLocalIceCandidate---")
    const newIceCandidate = new RTCIceCandidate(candidate);
    pc2.addIceCandidate(newIceCandidate);
  }
}

const handleOnRemoteIceCandidate = (event) => {
  const { candidate } = event;
  if(candidate) {
    const newIceCandidate = new RTCIceCandidate(candidate);
    pc1.addIceCandidate(newIceCandidate);
  }
}

const gotRemoteStream = (e) => {
  console.log("---gotRemoteStream---")
  console.log("---e---")
  console.log(e)
  remoteVideo.srcObject = e.streams[0];
}

const createAnswerSuccess = (description) => {
  console.log("---createAnswerSuccess--")
  console.log("---description---")
  console.log(description)
  pc2.setLocalDescription(description);
  pc1.setRemoteDescription(description);
}

const createAnswerFailed = () => {
  alert('createAnswerFailed');
}

const createOfferSuccess = (description) => {
  console.log("---createOfferSuccess---")
  pc1.setLocalDescription(description);

  pc2.setRemoteDescription(description);
  pc2.createAnswer()
  .then(createAnswerSuccess)
  .catch(createAnswerFailed)

}

const createOfferFailed = () => {
  alert('createOfferFailed');
}

const onCallButtonClicked = () => {
  console.log("---callButtonClicked---")
  pc1 = new RTCPeerConnection();
  pc1.addEventListener('icecandidate', handleOnLocalIceCandidate);

  pc2 = new RTCPeerConnection();
  pc2.addEventListener('icecandidate', handleOnRemoteIceCandidate);
  pc2.addEventListener('track', gotRemoteStream);

  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

  pc1.createOffer(offerOptions)
  .then(createOfferSuccess)
  .catch(createOfferFailed)
}

const callButton = document.getElementById('callButton');
callButton.addEventListener('click', onCallButtonClicked);

const hanldeOnHangUpButtonClicked = () => {
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
}

const hangUpButton = document.getElementById('hangUpButton');
hangUpButton.addEventListener('click', hanldeOnHangUpButtonClicked);