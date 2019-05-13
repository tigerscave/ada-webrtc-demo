'use strict';

const button = document.getElementById('button');
button.addEventListener('click', () => {
  const remoteVideo = window.opener.document.getElementById('remoteVideo1');
  document.getElementById('subVideo1').srcObject = remoteVideo.srcObject;
})