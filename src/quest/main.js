'use strict';

const socket = io("https://telp-public-server.herokuapp.com/");

let localStream = null;
let pc = null;    //peer connection
let sendChannel = null;    //for WebRTC data channel
let calleeId = "";
let shouldDeviceListShown = false;

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
  if(pc.iceConnectionState === 'connected') {
    document.getElementById('videoDevices').style.display = "unset";
  }
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
      audio: true,
      video: false
    }
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
    buttonNode.appendChild(document.createTextNode("STREAM AUDIO"));
    buttonNode.value = device.deviceId;
    buttonNode.addEventListener("click", () => onStreamVideoButtonClicked(device.deviceId, index));
    listNode.appendChild(buttonNode);

    deviceListEl.appendChild(listNode);
  })
}

const loadVideoDevices = () => {
  const videoDevices = [];
  navigator.mediaDevices.enumerateDevices()
  .then((devices) => {
    console.log(devices)
    devices.forEach((device) => {
      if(device.kind === 'audioinput') {
        videoDevices.push(device);
      }
    })
    console.log(videoDevices)
    displayDeviceList(videoDevices)
  })
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
    socket.emit("offer", {
      description,
      userId: targetId
    });
  })

}

const onCallButtonClicked = (targetId) => {
  calleeId = targetId;
  createPeerConnection();

  pc.createOffer(offerOptions)
  .then((description) => createOfferSuccess(calleeId, description))

  //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  // this fires negotiationneeded event
  sendChannel = pc.createDataChannel("dataChannel", null);
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
  console.log("onReloadButtonClicked")
  while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
  }
  socket.emit("getUserList");
}

const onHogeButtonClicked = () => {
  sendChannel.send("HOGE");
}

const onRefreshButtonClicked = () => {
  socket.emit("refreshOffer", calleeId);
  window.location.reload();
}

loadVideoDevices();
//document.getElementById('videoDevices').style.display = "none";

/* --- event listeners --- */

const hangUpButton = document.getElementById('hangUpButton');
hangUpButton.addEventListener('click', hanldeOnHangUpButtonClicked);

const reloadButton = document.getElementById("reloadButton");
reloadButton.addEventListener('click', onReloadButtonClicked);

const hogeButton = document.getElementById("hogeButton");
hogeButton.addEventListener('click', onHogeButtonClicked);

const refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener('click', onRefreshButtonClicked);

// let yaw = 90, pitch = 90;

document.getElementById("positionResetButton")
.addEventListener("click", () => {
  sendChannel.send(
    JSON.stringify({
      yaw: 90,
      pitch: 90
    })
  );
})

// document.getElementById("turnRightButton")
// .addEventListener("click", () => {
//   if(yaw < 160) {
//     yaw += 10;
//   }
//   sendChannel.send(
//     JSON.stringify({
//       yaw,
//       pitch: 90
//     })
//   );
// })

document.getElementById("turnLeftButton")
.addEventListener("click", () => {
  if(yaw > 0) {
    yaw -= 10;
  }
  sendChannel.send(
    JSON.stringify({
      yaw,
      pitch: 100
    })
  );
})

document.getElementById('statsButton').addEventListener('click', async () => {
  console.log("statsButton")
  const stats = await pc.getStats();
  console.log(stats)
  stats.forEach(stat => {
    console.log(stat)
  })
})

/* --- socket listeners --- */
socket.on('connect', () => {
  document.getElementById('socketId').innerText = socket.id;
});

socket.on('userList', users => {
  console.log("userList", users)
  const otherUsers = users.filter(user => user.id !== socket.id);
  
  otherUsers.map(user => {
    const listNode = document.createElement("LI");
    const textNode = document.createTextNode(user.name);
    listNode.appendChild(textNode);

    // add call button to each user
    const buttonNode = document.createElement("BUTTON");
    buttonNode.appendChild(document.createTextNode("CALL"));
    buttonNode.value = user.id;
    buttonNode.addEventListener("click", () => onCallButtonClicked(user.id));
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
    console.log("pc connectionState", pc.connectionState);
  })
})

const handleOnTrackConnection = event => {
  document.getElementById("remoteVideo").srcObject = event.streams[0];
};

socket.on("answerToWarpGo", description => {
  console.log("---socket.on answerToSender---")
  pc.addEventListener(
    "icecandidate",
    handleOnIceCandidate
  );
  pc.setRemoteDescription(description).then(() => {
    console.warn("---setRemoteDescription---")
    console.log(pc)
    console.log(pc.getSenders())
    console.log("signalingState", pc.signalingState);
    console.log("iceConnectionState", pc.iceConnectionState);
    console.log("iceGatheringState", pc.iceGatheringState);
    console.log("connectionState", pc.connectionState);
  }).catch((e) => {
    console.warn("ERROR: setRemoteDescription")
    console.log(e);
  })
  pc.addEventListener("track", handleOnTrackConnection);
});

// const manager = nipplejs.create({
//   zone: document.getElementById('yawStick'),
//   mode: 'static',
//   position: {left: '50%', bottom: '10%'},
//   color: 'red'
// });

// const THRESHOLD = 5;
// let tmp_yaw = 90;
// let tmp_pitch = 90;

// manager.on('move', (e, d) => {
//   const { radian } = d.angle;
//   const fixedDistance = d.distance/50 * 90;
//   yaw = parseInt(Math.cos(radian) * fixedDistance + 90);
//   console.log("yaw", yaw)
//   pitch = parseInt(Math.sin(radian) * fixedDistance + 90);
//   console.log("pitch", pitch)
//   if(Math.abs(tmp_yaw - yaw) > THRESHOLD) {
//     tmp_yaw = yaw;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           yaw,
//           pitch
//         })
//       );
//     }
//   }
//   if(Math.abs(tmp_pitch - pitch) > THRESHOLD) {
//     tmp_pitch = pitch;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           yaw,
//           pitch
//         })
//       );
//     }
//   }
// })

// manager.on('end', () => {
//   yaw = 90, pitch = 90;
//   if(sendChannel) {
//     sendChannel.send(
//       JSON.stringify({
//         yaw: 90,
//         pitch: 90
//       })
//     );
//   }
// })

// const managerRightArm = nipplejs.create({
//   zone: document.getElementById('rightArmStick'),
//   mode: 'static',
//   position: {right: '20%', bottom: '10%'},
//   color: 'blue'
// });

// const THRESHOLD_RIGHT_ARM = 5;
// let tmp_right_horizontal = 90;
// let tmp_right_vertical = 90;
// let rightHorizontal = 90, rightVertical = 90;

// managerRightArm.on('move', (e, d) => {
//   const { radian } = d.angle;
//   const fixedDistance = d.distance/50 * 90;
//   rightHorizontal = parseInt(Math.cos(radian) * fixedDistance + 90);
//   console.log("rightHorizontal", rightHorizontal)
//   rightVertical = parseInt(Math.sin(radian) * fixedDistance + 90);
//   console.log("rightVertical", rightVertical)
//   if(Math.abs(tmp_right_horizontal - rightHorizontal) > THRESHOLD) {
//     tmp_right_horizontal = rightHorizontal;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           rightHandHorizontal: rightHorizontal,
//           rightHandVertical: rightVertical
//         })
//       );
//     }
//   }
//   if(Math.abs(tmp_right_vertical - rightVertical) > THRESHOLD) {
//     tmp_right_vertical = rightVertical;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           rightHandHorizontal: rightHorizontal,
//           rightHandVertical: rightVertical
//         })
//       );
//     }
//   }
// })

// managerRightArm.on('end', () => {
//   yaw = 90, pitch = 90;
//   if(sendChannel) {
//     sendChannel.send(
//       JSON.stringify({
//         rightHandHorizontal: 90,
//         rightHandVertical: 90
//       })
//     );
//   }
// })

// const managerLeftArm = nipplejs.create({
//   zone: document.getElementById('leftArmStick'),
//   mode: 'static',
//   position: {left: '20%', bottom: '10%'},
//   color: 'green'
// });

// const THRESHOLD_RIGHT_LEFT = 5;
// let tmp_left_horizontal = 90;
// let tmp_left_vertical = 90;
// let leftHorizontal = 90, leftVertical = 90;

// managerLeftArm.on('move', (e, d) => {
//   const { radian } = d.angle;
//   const fixedDistance = d.distance/50 * 90;
//   leftHorizontal = parseInt(Math.cos(radian) * fixedDistance + 90);
//   console.log("leftHorizontal", leftHorizontal)
//   leftVertical = parseInt(Math.sin(radian) * fixedDistance + 90);
//   console.log("leftVertical", leftVertical)
//   if(Math.abs(tmp_left_horizontal - leftHorizontal) > THRESHOLD) {
//     tmp_left_horizontal = leftHorizontal;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           leftHandHorizontal: leftHorizontal,
//           leftHandVertical: 180 - leftVertical
//         })
//       );
//     }
//   }
//   if(Math.abs(tmp_left_vertical - leftVertical) > THRESHOLD) {
//     tmp_left_vertical = leftVertical;
//     if(sendChannel) {
//       sendChannel.send(
//         JSON.stringify({
//           leftHandHorizontal: leftHorizontal,
//           leftHandVertical: 180 - leftVertical
//         })
//       );
//     }
//   }
// })

// managerLeftArm.on('end', () => {
//   yaw = 90, pitch = 90;
//   if(sendChannel) {
//     sendChannel.send(
//       JSON.stringify({
//         leftHandHorizontal: 90,
//         leftHandVertical: 90
//       })
//     );
//   }
// })

document.getElementById("aSceneDiv").style.display = "none";

document.getElementById("switchVrButton").addEventListener("click", () => {
  document.getElementById("aSceneDiv").style.display = "unset";
  document.getElementById("nonVr").style.display = "none";
})