
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let widthInPixels = canvas.width;
let heightInPixels = canvas.height;

let widthInCells = 20;
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

// Would it be nicer if, instead of drawing them as we go, we returned an array
// of line segments and drew them all at once?
//
// Maybe. TODO?

function index (x, y) {
	return y * widthInCells + x;
}

const lines = [
	[],     // 0000
	[0, 1], // 0001
	[1, 2], // 0010
	[0, 2], // 0011
	[3, 0], // 0100
	[1, 3], // 0101
	[1, 2, 3, 0], // 0110
	[2, 3], // 0111
	[2, 3], // 1000
	[0, 1, 2 , 3], // 1001
	[1, 3], // 1010
	[3, 0], // 1011
	[0, 2], // 1100
	[1, 2], // 1101
	[0, 1], // 1110
	[], // 1111
];
function drawLines (x, y, l) {
	const pos = [
		[ 1,  0],
		[ 0,  1],
		[-1,  0],
		[ 0, -1],
	];
	let w = spacingWidth / 2;
	let h = spacingHeight / 2;

	for(let i = 0; i < l.length; i += 2){
		const p0 = l[i];
		const p1 = l[i+1];

		ctx.moveTo(x + pos[p0][0] * w, y + pos[p0][1] * h);
		ctx.lineTo(x + pos[p1][0] * w, y + pos[p1][1] * h);
	}
}

function draw () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#2c3";
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY){
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i){
			if(!active[i]) continue;
			const x = cellX * spacingWidth + offsetWidth;
			const y = cellY * spacingHeight + offsetHeight;
			ctx.fillRect(x, y, blockWidth, blockHeight);
		}
	}

	ctx.fillStyle = "#c23";
	for (let cellY = 0, i = 0; cellY < heightInCells; ++cellY){
		for (let cellX = 0; cellX < widthInCells; ++cellX, ++i){
			if(active[i]) continue;
			const x = cellX * spacingWidth + offsetWidth;
			const y = cellY * spacingHeight + offsetHeight;
			ctx.fillRect(x, y, blockWidth, blockHeight);
		}
	}

	ctx.lineWidth = 2;
	ctx.strokeStyle = "#ccd";
	ctx.beginPath();
	for (let cellY = 1; cellY < heightInCells; ++cellY){
		for (let cellX = 1; cellX < widthInCells; ++cellX){
			let a0 = Number(active[index(cellX  , cellY  )]);
			let a1 = Number(active[index(cellX-1, cellY  )]);
			let a2 = Number(active[index(cellX  , cellY-1)]);
			let a3 = Number(active[index(cellX-1, cellY-1)]);
			let conf = a0 << 0 | a1 << 1 | a2 << 2 | a3 << 3; 

			const x = cellX * spacingWidth;
			const y = cellY * spacingHeight;

			drawLines(x, y, lines[conf]);
		}
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

	draw();
});

draw();
