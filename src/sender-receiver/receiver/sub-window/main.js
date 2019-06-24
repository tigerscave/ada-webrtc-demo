'use strict';

const button = document.getElementById('button');
button.addEventListener('click', () => {
  const remoteVideo = window.opener.document.getElementById('remoteVideo1');
  document.getElementById('subVideo').srcObject = remoteVideo.srcObject;
  document.getElementById("videoContainer").style.display = 'unset';
})