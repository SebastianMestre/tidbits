
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let widthInPixels = canvas.width;
let heightInPixels = canvas.height;

let widthInCells  = 20;
let heightInCells = 15;
let totalCells = widthInCells * heightInCells;

const spacingWidth = widthInPixels / widthInCells;
const spacingHeight = heightInPixels / heightInCells;

const blockWidth = 6;
const blockHeight = blockWidth;

const offsetWidth = (spacingWidth - blockWidth) / 2;
const offsetHeight = (spacingHeight - blockHeight) / 2;

const centerOffsetWidth = spacingWidth / 2;
const centerOffsetHeight = spacingHeight / 2;

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

	ctx.fillStyle = "#2c3";
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY)
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i)
			if(active[i])
				squareAt(ctx, cellX, cellY);

	ctx.fillStyle = "#c23";
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY)
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i)
			if(!active[i])
				squareAt(ctx, cellX, cellY);

	drawLines(0, 0, widthInCells, heightInCells);
}

function updatedDraw (cellX, cellY) {

	{
		const x = cellX * spacingWidth + offsetWidth;
		const y = cellY * spacingHeight + offsetHeight;

		ctx.clearRect(
			x - spacingWidth,            y - spacingHeight,
			blockWidth + 2*spacingWidth, blockHeight + 2*spacingHeight
		);
	}

	for (let dx = -1; dx <= 1; ++dx) {
		for (let dy = -1; dy <= 1; ++dy) {

			let cx = cellX + dx;
			let cy = cellY + dy;

			if (active[index(cx, cy)]) {
				ctx.fillStyle = "#2c3";
			} else {
				ctx.fillStyle = "#c23";
			}

			squareAt(ctx, cx, cy);
		}
	}

	drawLines(
		Math.max(0, cellX-2), Math.max(0, cellY-2),
		Math.min(widthInCells, cellX+4), Math.min(heightInCells, cellY+4)
	);
}

function drawLines (startX, startY, endX, endY) {
	const lines = marchingSquares(startX, startY, endX, endY);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#ccd";
	ctx.beginPath();
	for (let i = 0; i < lines.length; i += 4) {
		ctx.moveTo(lines[i+0], lines[i+1]);
		ctx.lineTo(lines[i+2], lines[i+3]);
	}
	ctx.stroke();
}

canvas.addEventListener("click", function(evt){
	let px = evt.pageX;
	let py = evt.pageY;

	let bounds = canvas.getBoundingClientRect();

	let x = px - bounds.x;
	let y = py - bounds.y;

	if (x > bounds.width) return;
	if (y > bounds.height) return;
	
	let cellX = Math.floor(x / widthInPixels * widthInCells);
	let cellY = Math.floor(y / heightInPixels * heightInCells);

	let cellIndex = index(cellX, cellY);

	active[cellIndex] = !active[cellIndex];

	updatedDraw(cellX, cellY);
});

fullDraw();
