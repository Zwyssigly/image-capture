/*

var options = {
  capture: true,
  maxWidth: 512,
  maxHeight: 512,
  orientation: 'meta'|1-8,
  cropRatio: [16, 9],
  cropFit: 'contain|cover',
  cropColor: '#FFFFFF',
  mimeType: 'keep|image/*',
  quality: 0-1,
  output: 'blob|dataUrl'
}

*/

let rotationMap = {
  1: { counterClockwise: 8, clockwise: 6, flipHorizontally: 2, flipVertically: 4 },
  2: { counterClockwise: 5, clockwise: 7, flipHorizontally: 1, flipVertically: 3 },
  3: { counterClockwise: 6, clockwise: 8, flipHorizontally: 4, flipVertically: 2 },
  4: { counterClockwise: 7, clockwise: 5, flipHorizontally: 3, flipVertically: 1 },
  5: { counterClockwise: 4, clockwise: 2, flipHorizontally: 6, flipVertically: 8 },
  6: { counterClockwise: 1, clockwise: 3, flipHorizontally: 5, flipVertically: 7 },
  7: { counterClockwise: 2, clockwise: 4, flipHorizontally: 8, flipVertically: 6 },
  8: { counterClockwise: 3, clockwise: 1, flipHorizontally: 7, flipVertically: 5 }
}

class PictureResult {
  
  
  constructor(original, data, options) {
    this.original = original;
    this.data = data;
    this.options = options;
  }

  rotateClockwise() {
    return processFile(this.original, {
      ...this.options,
      orientation: rotationMap[this.options.orientation].clockwise
    });
  }

  rotateCounterClockwise() {
    return processFile(this.original, {
      ...this.options,
      orientation: rotationMap[this.options.orientation].counterClockwise
    });
  }

  flipHorizontally () {
    return processFile(this.original, {
      ...this.options,
      orientation: rotationMap[this.options.orientation].flipHorizontally
    });
  }

  flipVertically () {
    return processFile(this.original, {
      ...this.options,
      orientation: rotationMap[this.options.orientation].flipVertically
    });
  }
}


function fallback (options) {
  
  const defaultOptions = {
    capture: false,
    orientation: 'meta',
    mimeType: 'image/jpeg',
    quality: 0.75,
    output: 'blob',
    cropFit: 'cover'
  };

  options = { ...defaultOptions, ...options }; 

  if (!(options.debug instanceof Function)) {
    options.debug = options.debug
      ? err => console.log('[image-capture] ' + err())
      : () => {};
  }

  return options;
}

function openFile (options) {
  return new Promise((resolve, reject) => {
    let input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    if (options.capture) {
      input.capture = options.capture;
    }

    input.onchange = () => {
      if (input.files.length === 1) {
        resolve(input.files[0]);
      } else {
        reject("tbd");
      }
    }

    input.onerror = err => {
      reject(err);
    }

    input.click();
  });
}

function getOrientation (file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = () => {
      const view = new DataView(reader.result, 0);//, Math.min(256000, reader.result.length/3));

      if (view.getUint16(0, false) != 0xFFD8) {
          return reject("no_jpeg");
      }

      const length = view.byteLength
      let offset = 2;

      while (offset < length)
      {
          if (view.getUint16(offset+2, false) <= 8) {
            return reject("no_exif_orientation");
          }
          let marker = view.getUint16(offset, false);
          offset += 2;

          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              return reject("no_exif_orientation");
            }

            let little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                return resolve(view.getUint16(offset + (i * 12) + 8, little));
              }
            }
          } else if ((marker & 0xFF00) != 0xFF00) {
              break;
          }
          else { 
              offset += view.getUint16(offset, false);
          }
      }
      return reject("no_exif_orientation");
    };

    reader.readAsArrayBuffer(file);
  });
}

async function capturePicture (options) {
  options = fallback(options);
  var file = await openFile(options);
  return processFile(file, options);
}

function processPicture (file, options) {
  return processFile(file, fallback(options));
}

async function processFile (file, options) {
  let image = await loadImage(file);

  if (options.orientation === 'meta') {
    try {
      options.orientation = await getOrientation(file);
      options.debug(() => 'Read orientation from exif: ' + options.orientation);
    } catch (err) {
      options.orientation = 1;
      options.debug(() => 'Could not find any exif orientation: ' + err);
    }
  }

  var size = calculateSize(image, options);

  var canvas = renderImage(image, options, size)

  var data = await convert(file, canvas, options);

  return new PictureResult(file, data, options);
}

function convert (file, canvas, options) {
  var mimeType = options.mimeType;
  if (mimeType === 'keep') {
    mimeType = file.type;
  }
  
  switch (options.output) {
    case 'blob':
      return new Promise((resolve, reject) => {
        canvas.toBlob(resolve, mimeType, options.quality);
      });
    case 'dataUrl':
      return Promise.resolve(canvas.toDataURL(mimeType, options.quality));
  }

  return Promise.reject('invalid output type');
}

function loadImage (file) {
  return new Promise((resolve, reject) => {
    let url = URL.createObjectURL(file);
    let img = document.createElement('img');

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    }
    img.onerror = err => reject(err);

    img.src = url;
  });
}

function renderImage(image, options, size) {
  let canvas = document.createElement('canvas');

  canvas.width = size.transformed[0];
  canvas.height = size.transformed[1];

  let context = canvas.getContext('2d');

  if (options.cropColor) {
    context.fillStyle = options.cropColor;
    context.fillRect(0, 0, size.transformed[0], size.transformed[1]);
  }

  context.translate(size.transformed[0] / 2.0, size.transformed[1] / 2.0)

  switch (options.orientation) {
    case 2:
      context.scale(-1, 1);
      break;
    case 3:
      context.rotate(Math.PI);
      break;
    case 4:
      context.scale(1, -1);
      break;
    case 5:
      context.rotate(Math.PI / 2);
      context.scale(1, -1);
      break;
    case 6:
      context.rotate(Math.PI / 2);
      break;
    case 7:
      context.rotate(Math.PI / 2.0);
      context.scale(-1, 1);
      break;
    case 8:
      context.rotate(Math.PI / -2.0);
      break;
  }

  let scale = size.transformed[0] / size.original[0];
  
  if (options.cropFit) {
    let scaleY = size.transformed[1] / size.original[1];
    switch (options.cropFit) {
      case 'contain': 
        scale = Math.min(scale, scaleY);
        break;
      case 'cover':
        scale = Math.max(scale, scaleY);
        break;
      default:
        throw 'unkown_cropFit';
    }
  }

  context.scale(scale, scale);

  context.drawImage(image, image.naturalWidth / -2.0, image.naturalHeight / -2.0);

  return canvas;
}

function calculateSize(image, options) {

  var original = [image.naturalWidth, image.naturalHeight];
 
  if (options.orientation > 4) {
    let tmp = original[0];
    original[0] = original[1];
    original[1] = tmp;
  }

  var transformed = [...original];

  if (options.cropRatio instanceof Array && options.cropRatio.length === 2) {
    let factor = options.cropRatio[0] / options.cropRatio[1];
    let diff = transformed[0] * factor - transformed[1];
    let mode = (diff / Math.abs(diff)) | 0;

    if (mode < 0) {
      transformed = [transformed[0], (transformed[0] * factor) | 0];
    }
    else if (mode > 0) {
      transformed = [(transformed[1] / factor) | 0, transformed[1]];
    }
  } 

  let maxWidth = options.maxWidth || transformed[0];
  let maxHeight = options.maxHeight || transformed[1];

  if (transformed[0] > maxWidth || transformed[1] > maxHeight)
    {
      let factor = Math.max(transformed[0] / maxWidth, transformed[1] / maxHeight);

      transformed = [
        (transformed[0] / factor) | 0,
        (transformed[1] / factor) | 0,
      ];
    }

  return { original, transformed };
}

export {
  capturePicture,
  processPicture
}
