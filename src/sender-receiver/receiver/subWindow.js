'use strict';

const subWindowButton = document.getElementById('subWindowButton');
subWindowButton.addEventListener('click', () => {
  window.open("sub-window", "window_name", "width=600,height=600,scrollbars=yes");
})
