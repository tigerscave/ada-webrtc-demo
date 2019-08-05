'use strict';

const video = document.getElementById("video");

const hanldeLocalMediaStreamError = () => {
  alert("Error. Can not load media stream.")
}

const gotLocalMediaStrem = mediaStream => {
  video.srcObject = mediaStream;
}

const onVideoButtonClicked = () => {
  console.log("hello world");
  navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(gotLocalMediaStrem)
  .catch(hanldeLocalMediaStreamError)
};

const videoButton = document.getElementById('videoButton');
videoButton.addEventListener("click", onVideoButtonClicked);