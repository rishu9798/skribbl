
 //Flood fill implementation using scanline algorithm.
 //Much faster than recursive pixel-by-pixel fill.
 
export function floodFill(ctx, canvas, startX, startY, fillColorHex) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const fillColor = hexToRgba(fillColorHex);
  const targetColor = getPixel(data, startX, startY, width);

  // If target already matches fill color, do nothing
  if (colorsMatch(targetColor, fillColor)) return;

  const stack = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixel = getPixel(data, x, y, width);
    if (!colorsMatch(pixel, targetColor)) continue;

    setPixel(data, x, y, width, fillColor);

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function getPixel(data, x, y, width) {
  const i = (y * width + x) * 4;
  return [data[i], data[i+1], data[i+2], data[i+3]];
}

function setPixel(data, x, y, width, [r, g, b, a]) {
  const i = (y * width + x) * 4;
  data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = a;
}

function colorsMatch([r1, g1, b1, a1], [r2, g2, b2, a2], tolerance = 30) {
  return Math.abs(r1-r2) <= tolerance &&
         Math.abs(g1-g2) <= tolerance &&
         Math.abs(b1-b2) <= tolerance &&
         Math.abs(a1-a2) <= tolerance;
}

export function hexToRgba(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map(c => c+c).join('')
    : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
}

// Get canvas thumbnail as base64 PNG
 
export function getCanvasThumbnail(canvas, maxSize = 200) {
  const thumb = document.createElement('canvas');
  const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height);
  thumb.width  = Math.round(canvas.width  * ratio);
  thumb.height = Math.round(canvas.height * ratio);
  const ctx = thumb.getContext('2d');
  ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL('image/png');
}
