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