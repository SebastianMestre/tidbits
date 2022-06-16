
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#666";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let scale = 400;

const W = 32;

const cols = ((canvas.width  + W - 1) / W) | 0;
const rows = ((canvas.height + W - 1) / W) | 0;

const yuv2rgb = ({y,u,v}) => ({
	r:y+1.14*v,
	g:y-0.396*u-0.581*v,
	b:y+2.029*u
});
const to_css = ({r,g,b}) => `rgb(${r*255},${g*255},${b*255})`;

let basePos = {x : 0, y : 0, z : 0.5};

const world_to_screen = ({x,y}) => ({
	x: canvas.width  / 2 + (x - basePos.x) * scale,
	y: canvas.height / 2 - (y - basePos.y) * scale,
});

const screen_to_world = ({x,y}) => ({
	x: (x - canvas.width / 2)  / scale + basePos.x,
	y: (canvas.height / 2 - y) / scale + basePos.y,
});

const drawSpaceBounds = () => {
	let c1 = world_to_screen({x:-0.436, y:-0.615});
	let c2 = world_to_screen({x:0.436, y:0.615});
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.rect(c1.x, c2.y, c2.x-c1.x, c1.y-c2.y);
	ctx.stroke();
};

const linear2gamma = ({r,g,b}) => {
	const bad = r<0 || r>1 || g<0 || g>1 || b<0 || b>1;
	if(bad)return{r:0.5,g:0.5,b:0.5};
	return ({
		r: Math.pow(r, 1),
		g: Math.pow(g, 1),
		b: Math.pow(b, 1),
	})
};

const paint = ({xoff, yoff}, localW) => {
	for(let x = 0; x != cols; ++x){
		for(let y = 0; y != rows; ++y){

			const xpos = x*W + xoff;
			const ypos = y*W + yoff;

			const worldpos = screen_to_world({
				x:xpos+localW/2,
				y:ypos+localW/2
			});

			let input = {
				y : basePos.z,
				u : worldpos.x,
				v : worldpos.y,
			};

			const color = to_css(linear2gamma(yuv2rgb(input)));
			ctx.fillStyle = color;
			ctx.fillRect(xpos, ypos, localW, localW);

			drawSpaceBounds();
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

const zSlider = document.getElementById("z-slider");
zSlider.addEventListener("change", (evt) => {
	basePos.z = Number(zSlider.value);
	resetQueue();
});

consume();
setInterval(() => {
	consume();
}, 10);

