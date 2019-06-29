'use strict';

const gotLocalVideoStream = stream => {
  document.getElementById('myVideo').srcObject = stream;
}

const myVideo = () => {
  console.log("main");
  navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  .then(mediaStream => gotLocalVideoStream(mediaStream));
};

window.addEventListener('DOMContentLoaded', myVideo);