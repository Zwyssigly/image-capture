require("@babel/polyfill")

import { capturePicture } from '../index';

window.result = null;

function apply(result) {
  console.log(result);
  window.result = result;
  document.getElementById('img').src = result.data;
}

window.onload = () => {
  document.getElementById("btn").onclick = () => {
    capturePicture({
      output: 'dataUrl',
      cropColor: 'black',
      maxWidth: 512,
      maxHeight: 512,
      cropRatio: [1, 1],
      cropBehavior: 'contain',
      fixOrientation: true,
      capture: 'user',
      debug: true
    }).then(apply);
  };
  document.getElementById("cw").onclick = () => {
    window.result.rotateClockwise().then(apply);
  }
  document.getElementById("ccw").onclick = () => {
    window.result.rotateCounterClockwise().then(apply);
  }
  document.getElementById("fh").onclick = () => {
    window.result.flipHorizontally().then(apply);
  }
  document.getElementById("fv").onclick = () => {
    window.result.flipVertically().then(apply);
  }
}


//export default init;