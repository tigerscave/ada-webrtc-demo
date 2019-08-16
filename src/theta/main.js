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

const subWindowVr1Button = document.getElementById('subWindowVr1Button');
subWindowVr1Button.addEventListener('click', () => {
  window.open("sub-window/vr-window1.html", "sub-window1", "width=600,height=600,scrollbars=yes");
})

const subWindowVr2Button = document.getElementById('subWindowVr2Button');
subWindowVr2Button.addEventListener('click', () => {
  window.open("sub-window/vr-window2.html", "sub-window2", "width=600,height=600,scrollbars=yes");
})

document.getElementById('getResolutionButton')
  .addEventListener('click', () => {
    console.log("video height", video.videoHeight)
    console.log("video width", video.videoWidth)
  })