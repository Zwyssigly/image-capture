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
|  `capture` | `falsetrue|string`  |   |   |
|   |   |
|   |   |




 