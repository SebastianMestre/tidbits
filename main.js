
const ON_COLOR = "#a5be00";
const OFF_COLOR = "#679436";
const LINE_COLOR = "#efe7da";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let widthInPixels = canvas.width;
let heightInPixels = canvas.height;

let widthInCells  = 2 * 20;
let heightInCells = 2 * 15;
let totalCells = widthInCells * heightInCells;

const spacingWidth = widthInPixels / widthInCells;
const spacingHeight = heightInPixels / heightInCells;

const blockWidth = 20;
const blockHeight = blockWidth;

const offsetWidth = (spacingWidth - blockWidth) / 2;
const offsetHeight = (spacingHeight - blockHeight) / 2;

const centerOffsetWidth = spacingWidth / 2;
const centerOffsetHeight = spacingHeight / 2;

let offCanvas = document.createElement("canvas");
offCanvas.width  = blockWidth  + spacingWidth  * 2;
offCanvas.height = blockHeight + spacingHeight * 2;
let offCtx = offCanvas.getContext("2d");

let active = new Array(totalCells);
active.fill(false);
active = active.map(() => Math.random() < 0.5);

function index (x, y) {
	return y * widthInCells + x;
}

function marchingSquares (startX, startY, endX, endY) {

	// Marching squares builds a set of line segments that
	// separate boolean values placed on grid points.
	//
	// We build a bitmask that tells us which points are in
	// and which are out, around a certain grid cell.
	//
	// We then use that mask as an index into LUT, which
	// tells us which points we need on each case.
	//
	// This table only contains indices. To get the actual
	// positions, we use those indices to access the 'pos'
	// table

	const LUT = [
		[],           // 0000
		[0, 1],       // 0001
		[1, 2],       // 0010
		[0, 2],       // 0011
		[3, 0],       // 0100
		[1, 3],       // 0101
		[1, 2, 3, 0], // 0110
		[2, 3],       // 0111
		[2, 3],       // 1000
		[0, 1, 2, 3], // 1001
		[1, 3],       // 1010
		[3, 0],       // 1011
		[0, 2],       // 1100
		[1, 2],       // 1101
		[0, 1],       // 1110
		[],           // 1111
	];

	// The 4 lattice-line-center points that we will use to
	// build the line segments
	const pos = [
		[ 1,  0],
		[ 0,  1],
		[-1,  0],
		[ 0, -1],
	];

	const w = spacingWidth / 2;
	const h = spacingHeight / 2;

	const result = [];
	for (let cellY = startY+1; cellY < endY; ++cellY){
		for (let cellX = startX+1; cellX < endX; ++cellX){
			let a0 = Number(active[index(cellX  , cellY  )]);
			let a1 = Number(active[index(cellX-1, cellY  )]);
			let a2 = Number(active[index(cellX  , cellY-1)]);
			let a3 = Number(active[index(cellX-1, cellY-1)]);
			let conf = a0 << 0 | a1 << 1 | a2 << 2 | a3 << 3; 

			const x = cellX * spacingWidth;
			const y = cellY * spacingHeight;

			const l = LUT[conf];
			for(let i = 0; i < l.length; i += 2){
				const p0 = l[i];
				const p1 = l[i+1];

				// Map from grid-space to canvas-space
				let x0 = x + pos[p0][0] * w;
				let y0 = y + pos[p0][1] * h;
				let x1 = x + pos[p1][0] * w;
				let y1 = y + pos[p1][1] * h;

				result.push(x0, y0, x1, y1);
			}
		}
	}

	return result;
}

function squareAt (target, cellX, cellY) {
	// (cell * spacing) is the top left corner of the cell.
	// adding offset, puts us on the corner of the square.
	const x = cellX * spacingWidth + offsetWidth;
	const y = cellY * spacingHeight + offsetHeight;
	target.fillRect(x, y, blockWidth, blockHeight);
}

function fullDraw () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = ON_COLOR;
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY)
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i)
			if(active[i])
				squareAt(ctx, cellX, cellY);

	ctx.fillStyle = OFF_COLOR;
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY)
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i)
			if(!active[i])
				squareAt(ctx, cellX, cellY);

	drawLines(ctx, 0, 0, widthInCells, heightInCells);
}

function updatedDraw (cellX, cellY) {

	// We clear a 2x2 cell area around the updated point.
	// This includes neighboring squares.
	//
	// Then, we re-render the squares onto the main canvas,
	// and render the lines to an off-screen canvas, which
	// we then paint over the main canvas.
	//
	// This is done to prevent drawing lines over lines and
	// end up with aliasing and other artifacts.
	{
		// Top-left of square of the updated cell
		const x = cellX * spacingWidth + offsetWidth;
		const y = cellY * spacingHeight + offsetHeight;

		// Clear out a 2x2 cell area around the cell
		ctx.clearRect(
			// top-left of the square on the top left cell
			x - spacingWidth,
			y - spacingHeight,
			// until the bottom-right of the bottom right cell
			// note that we add the dimensions of the square,
			// not just those of the cells
			blockWidth  + 2 * spacingWidth,
			blockHeight + 2 * spacingHeight
		);
	}

	for (let dx = -1; dx <= 1; ++dx) {
		for (let dy = -1; dy <= 1; ++dy) {

			let cx = cellX + dx;
			let cy = cellY + dy;

			if (active[index(cx, cy)]) {
				ctx.fillStyle = ON_COLOR;
			} else {
				ctx.fillStyle = OFF_COLOR;
			}

			squareAt(ctx, cx, cy);
		}
	}

	{
		offCtx.clearRect(0,0,offCanvas.width,offCanvas.height);

		const x = cellX * spacingWidth + offsetWidth;
		const y = cellY * spacingHeight + offsetHeight;

		drawLines(
			offCtx,
			Math.max(0, cellX-2), Math.max(0, cellY-2),
			Math.min(widthInCells, cellX+3), Math.min(heightInCells, cellY+3),
			x - spacingWidth,
			y - spacingHeight
		);

		ctx.drawImage(
			offCanvas,
			x - spacingWidth,
			y - spacingHeight,
		);
	}
}

function drawLines (target, startX, startY, endX, endY, moveX = 0, moveY = 0) {
	const lines = marchingSquares(startX, startY, endX, endY);
	target.lineWidth = 2;
	target.strokeStyle = LINE_COLOR;
	target.beginPath();
	for (let i = 0; i < lines.length; i += 4) {
		target.moveTo(lines[i+0] - moveX, lines[i+1] - moveY);
		target.lineTo(lines[i+2] - moveX, lines[i+3] - moveY);
	}
	target.stroke();
}

canvas.addEventListener("click", function(evt){

	let x = evt.offsetX;
	let y = evt.offsetY;

	let cellX = Math.floor(x / widthInPixels * widthInCells);
	let cellY = Math.floor(y / heightInPixels * heightInCells);

	let cellIndex = index(cellX, cellY);

	active[cellIndex] = !active[cellIndex];

	updatedDraw(cellX, cellY);
});

fullDraw();
