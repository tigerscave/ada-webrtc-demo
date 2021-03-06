const PITCH_MIN = 70;
const PITCH_MAX = 150;

const YAW_MIN = 30;
const YAW_MAX = 150;

const RIGHT_HAND_HORIZONTAL_MIN = 50;
const RIGHT_HAND_HORIZONTAL_MAX = 150;

const RIGHT_HAND_VERTICAL_MIN = 30;
const RIGHT_HAND_VERTICAL_MAX = 120;

const LEFT_HAND_HORIZONTAL_MIN = 50;
const LEFT_HAND_HORIZONTAL_MAX = 150;

const LEFT_HAND_VERTICAL_MIN = 30;
const LEFT_HAND_VERTICAL_MAX = 120;

const THRESHOLD = 0;

let pitch = 90;
let yaw = 90;

const IMAGE_ROOT_URL = "https://adawarp.com/presentation/";
const IMAGE_FILE_NAME = "warp-man-pitch.";
const IMAGE_TAIL = ".jpeg";

const convertYawForManipulator = (y, resetValue) => {
  if (y - resetValue > 0) {
    y -= resetValue;
  } else {
    y = 360 - (resetValue - y);
  }

  if (0 <= y && y <= 90 - YAW_MIN) {
    y = 90 - y;
  } else if (90 - YAW_MIN < y && y <= 180) {
    y = YAW_MIN;
  } else if (180 < y && y <= 450 - YAW_MAX) {
    y = YAW_MAX;
  } else if (450 - YAW_MAX < y && y <= 360) {
    y = 450 - y;
  }
  return parseInt(y);
};

const convertPitchForManipulator = (p, resetValue) => {
  if (p - resetValue > 0) {
    p -= resetValue;
  } else {
    p = 360 - (resetValue - p);
  }

  if (0 <= p && p <= 90 - PITCH_MIN) {
    p = 90 - p;
  } else if (90 - PITCH_MIN < p && p <= 90) {
    p = PITCH_MIN;
  } else if (270 <= p && p <= 450 - PITCH_MAX) {
    p = PITCH_MAX;
  } else if (450 - PITCH_MAX < p && p <= 360) {
    p = 450 - p;
  }
  return parseInt(p);
};

AFRAME.registerComponent("rotation-reader", {
  tick: function() {
    // `this.el` is the element.
    // `object3D` is the three.js object.

    // `rotation` is a three.js Euler using radians. `quaternion` also available.
    //console.log(this.el.object3D.rotation);
    const { rotation } = this.el.object3D;

    const degRotation = {
      x: THREE.Math.radToDeg(rotation._x),
      y: THREE.Math.radToDeg(rotation._y)
    };

    const tmp_yaw = convertYawForManipulator(degRotation.y, 0);
    const tmp_pitch = convertPitchForManipulator(degRotation.x, 0);

    if (Math.abs(tmp_yaw - yaw) > THRESHOLD) {
      yaw = tmp_yaw;
      pitch = tmp_pitch;

      const d = { yaw: 180 - yaw, pitch: 180 - pitch };
      if (sendChannel) {
        sendChannel.send(JSON.stringify(d));
      }
    }

    if (Math.abs(tmp_pitch - pitch) > THRESHOLD) {
      yaw = tmp_yaw;
      pitch = tmp_pitch;

      const d = { yaw: 180 - yaw, pitch: 180 - pitch };
      if (sendChannel) {
        sendChannel.send(JSON.stringify(d));
      }
    }

    yaw = tmp_yaw;
    pitch = tmp_pitch;
  }
});

let slideNumber = 0;
const MIN_SLIDE_NUM = 1;
const MAX_SLIDE_NUM = 30;

const generateSlideUrl = number => {
  const nextSlideNumber = slideNumber + number;
  if (nextSlideNumber < MIN_SLIDE_NUM) {
    slideNumber = MIN_SLIDE_NUM;
    return (
      IMAGE_ROOT_URL +
      IMAGE_FILE_NAME +
      String(MIN_SLIDE_NUM).padStart(3, "0") +
      IMAGE_TAIL
    );
  } else if (nextSlideNumber > MAX_SLIDE_NUM) {
    slideNumber = MAX_SLIDE_NUM;
    return (
      IMAGE_ROOT_URL +
      IMAGE_FILE_NAME +
      String(MAX_SLIDE_NUM).padStart(3, "0") +
      IMAGE_TAIL
    );
  } else {
    slideNumber += number;
    return (
      IMAGE_ROOT_URL +
      IMAGE_FILE_NAME +
      String(nextSlideNumber).padStart(3, "0") +
      IMAGE_TAIL
    );
  }
};

const refreshAImage = imageUrl => {
  const aEntity = document.getElementById("aEntity");
  while (aEntity.firstChild) {
    aEntity.removeChild(aEntity.firstChild);
  }

  const slideImage = document.getElementById("slideImage");

  slideImage.src = imageUrl;

  const aImageNode = document.createElement("a-image");
  aImageNode.setAttribute("width", "4.8");
  aImageNode.setAttribute("height", "2.7");
  aImageNode.setAttribute("position", "3 -2 -10");
  aImageNode.setAttribute("src", "#slideImage");

  slideImage.onload = () => {
    aEntity.appendChild(aImageNode);
  };
};

const sendSlideImage = isForward => {
  const slideImageUrl = generateSlideUrl(isForward ? 1 : -1);
  refreshAImage(slideImageUrl);
  if (sendChannel) {
    sendChannel.send(
      JSON.stringify({
        slideImageUrl
      })
    );
  }
};

document.onkeydown = e => {
  const { code } = e;
  if (code === "ArrowRight") {
    sendSlideImage(true);
  } else if (code === "ArrowLeft") {
    sendSlideImage(false);
  }
};

let enableToSend = true;

const convertRightHandHorizontalDeg = y => {
  const convertedDeg = y + 90;
  if (convertedDeg > RIGHT_HAND_HORIZONTAL_MAX) {
    return RIGHT_HAND_HORIZONTAL_MAX;
  } else if (convertedDeg < RIGHT_HAND_HORIZONTAL_MIN) {
    return RIGHT_HAND_HORIZONTAL_MIN;
  } else {
    return convertedDeg;
  }
};

const convertRightHandVerticalDeg = x => {
  const convertedDeg = x + 30;
  if (convertedDeg > RIGHT_HAND_VERTICAL_MAX) {
    return RIGHT_HAND_VERTICAL_MAX;
  } else if (convertedDeg < RIGHT_HAND_VERTICAL_MIN) {
    return RIGHT_HAND_VERTICAL_MIN;
  } else {
    return convertedDeg;
  }
};

let tmp_rightHandHorizontal = 90;
let tmp_rightHandVertical = 90;

AFRAME.registerComponent("oculus-quest-right", {
  tick: function() {
    const { rotation, position } = this.el.object3D;
    const degRotation = {
      x: parseInt(THREE.Math.radToDeg(rotation._x)),
      y: parseInt(THREE.Math.radToDeg(rotation._y)),
      z: parseInt(THREE.Math.radToDeg(rotation._z))
    };

    if (sendChannel && enableToSend) {
      const rightHandHorizontal = convertRightHandHorizontalDeg(degRotation.y);
      const rightHandVertical = convertRightHandVerticalDeg(degRotation.x);

      if (
        Math.abs(rightHandHorizontal - tmp_rightHandHorizontal) > 0 &&
        Math.abs(rightHandVertical - tmp_rightHandVertical) > 0
      ) {
        sendChannel.send(
          JSON.stringify({
            rightHandHorizontal: 180 - rightHandHorizontal,
            rightHandVertical
          })
        );
        tmp_rightHandHorizontal = rightHandHorizontal;
        tmp_rightHandVertical = rightHandVertical;
      }
    }
  }
});

const convertLeftHandHorizontalDeg = y => {
  const convertedDeg = y + 90;
  if (convertedDeg > LEFT_HAND_HORIZONTAL_MAX) {
    return LEFT_HAND_HORIZONTAL_MAX;
  } else if (convertedDeg < LEFT_HAND_HORIZONTAL_MIN) {
    return LEFT_HAND_HORIZONTAL_MIN;
  } else {
    return convertedDeg;
  }
};

const convertLeftHandVerticalDeg = x => {
  const convertedDeg = x + 30;
  if (convertedDeg > LEFT_HAND_VERTICAL_MAX) {
    return LEFT_HAND_VERTICAL_MAX;
  } else if (convertedDeg < LEFT_HAND_VERTICAL_MIN) {
    return LEFT_HAND_VERTICAL_MIN;
  } else {
    return convertedDeg;
  }
};

let tmp_leftHandHorizontal = 90;
let tmp_leftHandVertical = 90;

AFRAME.registerComponent("oculus-quest-left", {
  tick: function() {
    const { rotation, position } = this.el.object3D;
    const degRotation = {
      x: parseInt(THREE.Math.radToDeg(rotation._x)),
      y: parseInt(THREE.Math.radToDeg(rotation._y)),
      z: parseInt(THREE.Math.radToDeg(rotation._z))
    };

    if (sendChannel && enableToSend) {
      const leftHandHorizontal = convertLeftHandHorizontalDeg(degRotation.y);
      const leftHandVertical = convertLeftHandVerticalDeg(degRotation.x);

      if (
        Math.abs(leftHandHorizontal - tmp_leftHandHorizontal) > THRESHOLD &&
        Math.abs(leftHandVertical - tmp_leftHandVertical) > THRESHOLD
      ) {
        sendChannel.send(
          JSON.stringify({
            leftHandHorizontal: 180 - leftHandHorizontal,
            leftHandVertical: 180 - leftHandVertical
          })
        );
        tmp_leftHandHorizontal = leftHandHorizontal;
        tmp_leftHandVertical = leftHandVertical;
      }
    }
  }
});
