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
| `cropFit`  | `'cover'⎮contain'`  | `cover` |  |
| `cropColor`  | `string`  | `#000000` |   |
| `mimeType`  | `'keep'⎮string`  | `'image/jpeg'` |   |
| `quality` | `0-1` | `0.75` | |
| `output` | `'blob'⎮dataUrl'` | `'blob'` |  |
