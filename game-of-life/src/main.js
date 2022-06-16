import { draw } from './drawing.js';
import { make_grid, step } from './simulation.js';

let paused = false;
const width = 80;
const height = 60;
const grids = [make_grid(width, height), make_grid(width, height)];

const init = () => {
	for (let i = 1; i < height-1; ++i) {
		for (let j = 1; j < width-1; ++j) {
			grids[0][i][j] = Math.random() < 0.5 ? 1 : 0;
		}
	}
};

const update = () => {
	step(grids);
	draw(grids[0]);
};

const next_frame = () => {
	if (!paused)
		update();
};

document
	.getElementById("button-pause-play")
	.addEventListener("click", () => {
		paused = !paused;
	});

document
	.getElementById("button-step")
	.addEventListener("click", () => {
		update();
	});

document
	.getElementById("button-clear")
	.addEventListener("click", () => {
		grids[0] = make_grid(width, height);
		draw(grids[0]);
	});

document
	.getElementById("button-init")
	.addEventListener("click", () => {
		init();
		draw(grids[0]);
	});

init();
draw(grids[0]);

setInterval(next_frame, 100);
