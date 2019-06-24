'use strict';

const subWindow1Button = document.getElementById('subWindow1Button');
subWindow1Button.addEventListener('click', () => {
  window.open("sub-window/window1.html", "window1", "width=600,height=600,scrollbars=yes");
})

const subWindow2Button = document.getElementById('subWindow2Button');
subWindow2Button.addEventListener('click', () => {
  window.open("sub-window/window2.html", "window2", "width=600,height=600,scrollbars=yes");
})

const subWindow3Button = document.getElementById('subWindow3Button');
subWindow3Button.addEventListener('click', () => {
  window.open("sub-window/window3.html", "window3", "width=600,height=600,scrollbars=yes");
})

const subWindow4Button = document.getElementById('subWindow4Button');
subWindow4Button.addEventListener('click', () => {
  window.open("sub-window/window4.html", "window4", "width=600,height=600,scrollbars=yes");
})

const subWindow5Button = document.getElementById('subWindow5Button');
subWindow5Button.addEventListener('click', () => {
  window.open("sub-window/window5.html", "window5", "width=600,height=600,scrollbars=yes");
})

const subWindowVrButton = document.getElementById('subWindowVrButton');
subWindowVrButton.addEventListener('click', () => {
  window.open("sub-window/windowVr.html", "sub-window", "width=600,height=600,scrollbars=yes");
})