'use strict';

const AXE_THRESHOLD = 0.1;

let vibrationActuator = null;
let gamePad = null;

const rAF =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame;

let joystickLY = 0;
let tmpJoystickLY = 0;
let joystickRY = 0;
let tmpJoystickRY = 0;

const buttonHandler = btns => {
  //console.log(btns);
}

const axesHandler = axes => {
  joystickLY = axes[1];
  joystickRY = axes[3];

  if(Math.abs(joystickLY - tmpJoystickLY) > AXE_THRESHOLD) {
    const data = { joystickLY };
    sendChannel.send(JSON.stringify(data));
    tmpJoystickLY = joystickLY;
  }

  if(Math.abs(joystickRY - tmpJoystickRY) > AXE_THRESHOLD) {
    socket.emit("joystickRY", joystickRY);
    const data = { joystickRY };
    sendChannel.send(JSON.stringify(data));
    tmpJoystickRY = joystickRY;
  }
}

const update = () => {
  const gamePadList = navigator.getGamepads();
  gamePad = gamePadList[0];  
  
  if(gamePad) {
    vibrationActuator = gamePad.vibrationActuator;
    buttonHandler(gamePad.buttons);
    axesHandler(gamePad.axes);
  }
  rAF(update);
}

rAF(update);

const onVibrationbuttonClicked = () => {
  if(gamePad) {
    vibrationActuator.playEffect("dual-rumble", {
      startDelay: 0,
      duration: 500,
      weakMagnitude: 0.5,
      strongMagnitude: 0.5
    });
  } else {
    alert("no gamepad connected or press any button");
  }
}

const main = () => {
  document.getElementById('vibrationButton')
    .addEventListener('click', onVibrationbuttonClicked)
}

window.addEventListener("DOMContentLoaded", main);