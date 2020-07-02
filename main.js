import {Cpx} from './complex.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#666";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// (z^2 - 1) * (z + 2 - i)^2 / (z^2 + 2 - 2i)
const func = z =>
	Cpx.over(
		Cpx.times(
			Cpx.minus(Cpx.square(z), Cpx.real(1)),
			Cpx.square(Cpx.plus(z, Cpx.comp(2, -1)))),
		Cpx.plus(Cpx.square(z), Cpx.comp(2, -2)));

window.func = func;
window.Cpx = Cpx;

let scale = 40;

const W = 32;

const cols = ((canvas.width  + W - 1) / W) | 0;
const rows = ((canvas.height + W - 1) / W) | 0;

const colorFromComplex = ({re, im}) => {

	let angle = Math.atan2(re, im);

	let g = (Math.sin((re**2 + im**2)**0.5) + 1) * 0.25 + 0.25;

	return `hsl(${angle * 180 / Math.PI},70%,${g*50}%)`
};

let basePos = {x : 0, y : 0};

const paint = ({xoff, yoff}, localW) => {
	for(let x = 0; x != cols; ++x){
		for(let y = 0; y != rows; ++y){

			const xpos = x*W + xoff;
			const ypos = y*W + yoff;

			let input = {
				re : ((xpos + localW/2) - canvas.width / 2) / scale + basePos.x,
				im : (canvas.height / 2 - (ypos + localW/2)) / scale + basePos.y,
			};

			let output = func(input);

			const color = colorFromComplex(output);
			ctx.fillStyle = color;
			ctx.fillRect(xpos, ypos, localW, localW);
		}
	}
};

let queue = [
	[{xoff:0, yoff:0}, W],
];

const resetQueue = () => {
	queue = [
		[{xoff:0, yoff:0}, W],
	];
};

const setBasePos = (newVals) => {
	Object.assign(basePos, newVals);
	resetQueue();
}

window.setBasePos = setBasePos;
window.getBasePos = () => basePos;


const consume = () => {
	if(queue.length == 0)
		return;

	const work = queue.shift();
	const [oldOff, oldW] = work;

	if(oldW > 1){

		const newW = oldW/2;

		queue.push([{xoff:oldOff.xoff     , yoff:oldOff.yoff},      newW]);
		queue.push([{xoff:oldOff.xoff+newW, yoff:oldOff.yoff},      newW]);
		queue.push([{xoff:oldOff.xoff+newW, yoff:oldOff.yoff+newW}, newW]);
		queue.push([{xoff:oldOff.xoff,      yoff:oldOff.yoff+newW}, newW]);
	}

	paint(...work);
};

let oldpos = null;
canvas.addEventListener("dragstart", (evt) => {
	oldpos = null;

	// https://stackoverflow.com/questions/38655964/how-to-remove-dragghost-image
	var img = new Image();
	img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
	evt.dataTransfer.setDragImage(img, 0, 0);
});

canvas.addEventListener("drag", (evt) => {
	if(evt.x == 0 && evt.y == 0) return;

	const newpos = {x:evt.x, y:evt.y};

	if(oldpos === null)
		return void(oldpos = newpos);

	let delta = {
		x: newpos.x-oldpos.x,
		y: newpos.y-oldpos.y
	};

	if(delta.x != 0 || delta.y != 0){
		setBasePos({
			x: basePos.x - delta.x/scale,
			y: basePos.y + delta.y/scale
		});
	}

	oldpos = newpos;
});

canvas.addEventListener("wheel", (evt) => {
	let logScale = Math.log(scale);
	logScale += evt.deltaY * 0.003;
	scale = Math.exp(logScale);
	resetQueue();
});

consume();
setInterval(() => {
	consume();
}, 10);

