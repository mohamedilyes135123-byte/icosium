const fs = require('fs');
const buffer = fs.readFileSync('apps/patient/public/icon_labs.png');
// PNG header is 8 bytes, IHDR chunk follows. IHDR is 13 bytes.
// offset 24 is bit depth, offset 25 is color type
// color type 6 is Truecolor with alpha, color type 4 is Grayscale with alpha
const colorType = buffer[25];
console.log('Color type:', colorType);
if (colorType === 6 || colorType === 4) {
  console.log('This image HAS an alpha channel (transparency).');
} else {
  console.log('This image does NOT have an alpha channel.');
}
