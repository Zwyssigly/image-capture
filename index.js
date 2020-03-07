/*

var options = {
  capture: 'environment|user|promt',
  maxWidth: 512,
  maxHeight: 512,
  fixOrientation: true,
  cropRatio: [16, 9],
  cropBehavior: 'contain|cover',
  cropColor: '#FFFFFF',
  mimeType: 'keep|image/*',
  quality: 0-1,
  output: 'blob|dataUrl'
}

*/


function fallback (options) {
  
  const defaultOptions = {
    capture: 'environment',
    fixOrientation: true,
    mimeType: 'image/jpeg',
    quality: 0.75,
    output: 'blob',
    cropBehavior: 'cover'
  };

  return { ...defaultOptions, ...options }; 
  
}

function openFile (options) {
  return new Promise((resolve, reject) => {
    let input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.capture = options.capture;
    input.multiple = false;

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
      const view = new DataView(reader.result, 0, 256000);

      if (view.getUint16(0, false) != 0xFFD8) {
          return reject("is not a jpeg");
      }

      const length = view.byteLength
      let offset = 2;

      while (offset < length)
      {
          if (view.getUint16(offset+2, false) <= 8) return callback(-1);
          let marker = view.getUint16(offset, false);
          offset += 2;

          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              return reject("orientation is not defined");
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
      return reject("orientation is not defined");
    };

    reader.readAsArrayBuffer(file);
  });
}

async function capturePicture (options) {
  options = fallback(options);
  var file = await openFile(options);
  return processFile(file, options);
}

async function dropPicture (file, options) {
  options = fallback(options);
  return processFile(file, options);
}

async function processFile (file, options) {
  let image = await loadImage(file);

  let orientation = options.fixOrientation ? await getOrientation(file) : 1;

  var size = await calculateSize(image, options, orientation);

  var canvas = renderImage(image, options, size, orientation)

  return await convert(file, canvas, options);
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

function renderImage(image, options, size, orientation) {
  let canvas = document.createElement('canvas');

  canvas.width = size.transformed[0];
  canvas.height = size.transformed[1];

  let context = canvas.getContext('2d');

  if (options.cropColor) {
    context.fillStyle = options.cropColor;
    context.fillRect(0, 0, size.transformed[0], size.transformed[1]);
  }

  context.translate(size.transformed[0] / 2.0, size.transformed[1] / 2.0)

  if (options.fixOrientation) {
    switch (orientation) {
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
  }

  let scale = size.transformed[0] / size.original[0];
  
  if (options.cropBehavior) {
    let scaleY = size.transformed[1] / size.original[1];
    switch (options.cropBehavior) {
      case 'contain': 
        scale = Math.min(scale, scaleY);
        break;
      case 'cover':
        scale = Math.max(scale, scaleY);
        break;
      default:
        throw 'excaption';
    }
  }

  context.scale(scale, scale);

  context.drawImage(image, image.naturalWidth / -2.0, image.naturalHeight / -2.0);

  return canvas;
}

async function calculateSize(image, options, orientation) {

  var original = [image.naturalWidth, image.naturalHeight];

  if (options.fixOrientation) {    
    if (orientation > 4) {
      let tmp = original[0];
      original[0] = original[1];
      original[1] = tmp;
    }
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
  capturePicture
}
