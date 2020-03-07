require("@babel/polyfill")

import { capturePicture } from '../index';

window.onload = () => {
  document.getElementById("btn").onclick = () => {
    capturePicture({
      output: 'dataUrl',
      cropColor: 'red',
      maxWidth: 512,
      maxHeight: 512,
      cropRatio: [1, 1],
      cropBehavior: 'cover',
      fixOrientation: false,
      capture: 'user'
    }).then(url => {
      console.log(url);
      document.getElementById('img').src = url;
    });
  }
}


//export default init;