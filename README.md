### WARNING
This Package is under early development and will have breaking changes and bugs !!!

### Description
`image-capture` is a client library to process captured images before upload.

### Features
 - get an image from either the file system or directly from camera
 - down scale to image to maximum width and heigth
 - crop the image to an aspect ratio with two differnt modes: contain, cover
 - rotate and flip the image before upload
 - fix orientation from exif tag before upload
 
### Example
```javascript
import { capturePicture } from '../index';

window.result = null;
window.onload = () => {
  document.getElementById("btn").onclick = () => {
    capturePicture({
      output: 'dataUrl',
      cropColor: '#FF0000',
      maxWidth: 512,
      maxHeight: 512,
      cropRatio: [1, 1],
      cropBehavior: 'contain',
      capture: 'environment',
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

function apply(result) {
  console.log(result);
  window.result = result;
  document.getElementById('img').src = result.data;
}
```
 
### Methods
|   Signature |  Description |
| ------------ | ------------ |
|  `capturePicture(options: Options): Promise<PictureResult>` |  open the file dialog or camera and process the return file with the given options |
| `processPicture(file: Blob, options: Options): Promise<PictureResult>` |  in case you already got a file instance |

### Options
|  Option | Type  | Default | Description |
| ------------ | ------------ | ------------ | ------------ |
|  `capture`  | `false⎮'environment'⎮'user'` | `false` | when set, it will open the camera instead of a file dialog on smart phones  |
|  `maxWidth` | `false⎮int`  | `false` | images is scaled down to fit within the given width |
|  `maxHeight` | `false⎮int`  | `false` | images is scaled down to fit within the given height |
|  `maxHeight` | `false⎮int`  | `false` | images is scaled down to fit within the given height |
| `orientation`  | `'meta'⎮1-8`  | `'meta'` | either get orientation from exif or uses the given orientation. (1 means no rotation or flipping) |
| `cropRatio`  | `false⎮[int, int]`  | `false` | when set, it will enforce given ratio and crop the picture to fit |
| `cropFit`  | `'cover'⎮'contain'`  | `'cover'` |  defines how the images is fit into the new aspect ratio |
| `cropColor`  | `string`  | `'#000000'` |  defines the background color in case cropFit is set to `'contain'` |
| `mimeType`  | `'keep'⎮string`  | `'image/jpeg'` |  `'keep'` keeps the original format   |
| `quality` | `0-1` | `0.75` | image quality |
| `output` | `'blob'⎮'dataUrl'` | `'blob'` | how the processed image is returned |
| `debug` | `bool⎮Function` | `false` | when true logs debug information to console otherwise it will use the given Function |

### PictureResult

|  Signature  | Description   |
| ------------ | ------------ |
|  `original: Blob` |  original file  |
|  `data: Blob⎮string` | processed image either as blob or as data url  |
|  `options: Options` |  options used to process the image |
| `rotateClockwise(): Promise<PictureResult>` | processes the image again with different orientation |
| `rotateCounterClockwise(): Promise<PictureResult>` | processes the image again with different orientation |
| `flipHorizontally(): Promise<PictureResult>` | processes the image again with different orientation |
| `flipVertically(): Promise<PictureResult>` | processes the image again with different orientation |
