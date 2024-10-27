
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

function drawWithScale(scale, init, paint) {

	const offscreenWidth = Math.floor(width / scale);
	const offscreenHeight = Math.floor(height / scale);

	init(offscreenWidth, offscreenHeight);

	const start = performance.now();

	const offscreenCanvas = new OffscreenCanvas(offscreenWidth, offscreenHeight);
	const offscreenContext = offscreenCanvas.getContext("2d");

	const imageData = context.createImageData(offscreenWidth, offscreenHeight);
	// imageData.data is a Uint8ClampedArray with pixel data in RGBA format

	for (let i = 0; i < offscreenHeight; ++i) {
		for (let j = 0; j < offscreenWidth; ++j) {
			const idx = i * offscreenWidth + j;
			const x = (j + 0.5) / offscreenWidth;
			const y = 1 - (i + 0.5) / offscreenHeight;
			const [r, g, b] = paint(x, y);
			imageData.data[idx * 4 + 0] = r;
			imageData.data[idx * 4 + 1] = g;
			imageData.data[idx * 4 + 2] = b;
			imageData.data[idx * 4 + 3] = 255;
		}
	}
	offscreenContext.putImageData(imageData, 0, 0);

	const ending = performance.now();

	context.drawImage(offscreenCanvas, 0, 0, offscreenWidth, offscreenHeight, 0, 0, width, height);

	console.log("drew image downscaled", scale, "times in", ending - start, "milliseconds");
}

function incremental(scale, init, paint) {
	if (scale < 1) return;
	drawWithScale(scale, init, paint);
	setTimeout(() => {
		incremental(Math.floor(scale / 2), init, paint);
	}, 0);
}

