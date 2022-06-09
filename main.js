
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const FRAME_TIME = 15;

let state = [];
let network = [[]];
let time = 0;
let sorting = false;
let automatico = true;
let viewMode = "array";

const COMPARE_MS = 200;
const SWAP_MS = 300;

const N = 8;

function init() {

	const shuffle = [];
	for (let i = 0; i < N; ++i)
		shuffle.push({i, ran: Math.random()});
	shuffle.sort((a, b) => a.ran - b.ran);

	state = [];
	for (let i = 0; i < N; ++i) {
		state.push({value: shuffle[i].i , position: i, highlighted: false});
	}
}

async function highlight(i) {
	state[i].highlighted = true;
}

async function unhighlight(i) {
	state[i].highlighted = false;
}

function wait(time) {
	return new Promise((resolve, error) => setTimeout(() => resolve(), time));
}

async function move(i, j) {
	const STEPS = Math.ceil(SWAP_MS / FRAME_TIME);
	const startPos = state[i].position;
	const endPos = j;
	for (let k = 0; k < STEPS; ++k) {
		const t = (k+1) / STEPS;
		state[i].position = startPos * (1-t) + endPos * t;
		await wait(FRAME_TIME);
	}
}

async function lessThan(i, j) {
	await Promise.all([highlight(i), highlight(j)]);
	await wait(COMPARE_MS);
	await Promise.all([unhighlight(i), unhighlight(j)]);

	return state[i].value < state[j].value;
}

async function exchange(i, j) {
	await Promise.all([
		move(j, i),
		move(i, j),
	]);

	let temp = state[i];
	state[i] = state[j];
	state[j] = temp;
}

async function doCompare(i, j) {
	if (await lessThan(j, i))
		await exchange(i, j);
}

function showError(error) {
	alert(error);
}

function parse(input) {

	const lines = input
		.split('\n')
		.map(line => line
			.split(' ')
			.filter(x => x.length > 0));

	const parsedLines = lines.map((line, i) => {
		if (line.length == 0) return { ok: null };
		if (line.length < 2) return { error: "La linea contiene menos de dos campos", idx: i };
		if (line.length > 2) return { error: "La linea contiene mas de dos campos", idx: i };
		const indices = line.map(Number);
		if (!indices.every(Number.isSafeInteger)) return { error: "Uno de los campos no es un numero", idx: i };
		return { ok: indices };
	});

	if (parsedLines.some(x => x.error)) {
		showError(parsedLines.filter(x => x.error).map(({idx, error}) => `Linea ${idx}: ${error}`).join('\n'));
		return { error: true };
	}

	const result = parsedLines.map(x => x.ok).filter(x => x !== null);

	return { ok: result };
}

function dibujar() {
	if (viewMode === "array")
		dibujarScatter();
	else
		dibujarRails();
}

function splitEvenly(space, parts, pos) {
	const spacePerPart = Math.floor(space / parts);
	const extraSpace = space - spacePerPart * parts;

	const padding = Math.floor(extraSpace / 2);
	const offset = Math.floor(spacePerPart / 2);

	return pos * spacePerPart + offset + padding;
}

function dibujarScatter() {
	ctx.clearRect(0,0,cnv.width,cnv.height);
	const R = 10;
	const W = R + R;

	for (let i = 0; i < state.length; ++i) {
		const {value, position, highlighted} = state[i];
		if (highlighted) {
			ctx.fillStyle = "#f00";
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.fillRect(xPos(position) - R, yPos(value) - R, W, W);
	}

	function xPos(pos) {
		return splitEvenly(cnv.width, state.length, pos);
	}

	function yPos(val) {
		return splitEvenly(cnv.height, state.length, val);
	}
}


function dibujarRails() {
	ctx.clearRect(0,0,cnv.width,cnv.height);
	
	const M = network.length;

	ctx.fillStyle = "#666";
	for (let i = 0; i < N; ++i) {
		ctx.fillRect(railPos(i) - 1, 0, 2, cnv.height);
	}

	ctx.lineWidth = 2;
	ctx.strokeStyle = "#666";
	ctx.beginPath();
	for (let level = 0; level < network.length; ++level) {
		for (const comparator of network[level]) {
			const [i, j] = comparator;

			const x0 = railPos(i);
			const x1 = railPos(j);
			const yl = levelPos(level);

			const dx = x1 - x0;

			const x = x0 + dx / 2;
			const y = yl - dx

			const radius = Math.sqrt((x0-x)**2 + (yl-y)**2);
			const angle  = Math.atan2(yl - y, x1 - x);

			// ctx.fillRect(x0, yl-1, x1-x0, 2);

			ctx.moveTo(x1, yl);
			ctx.arc(x, y, radius, angle, Math.PI - angle);
		}
	}
	ctx.stroke();

	const R = 10;
	const W = R + R;

	ctx.font = `${W}px monospace`;

	const fixup = 5;

	for (let i = 0; i < N; ++i) {
		const {value, position, highlighted} = state[i];
		if (highlighted) {
			ctx.fillStyle = "#f00";
		} else {
			ctx.fillStyle = "#fff";
		}
		const x = railPos(position) - R;
		const y = levelPos(time) - R;
		// ctx.fillRect(x, y, W, W);
		ctx.fillText(value + "", x + fixup, y);
	}

	function railPos(rail) {
		return splitEvenly(cnv.width, N, rail);
	}

	function levelPos(level) {
		return splitEvenly(cnv.height, M+1, level);
	}
}


function readNetwork() {
	const input = document.getElementById("textarea").value;
	const maybe_network = parse(input);
	if (maybe_network.error) return;
	network = collapseNetwork(maybe_network.ok);
	console.log(network);
}

function collapseNetwork(network) {
	const times = [];
	for (let i = 0; i < N; ++i) {
		times.push(-1);
	}

	const groups = [];
	for (const _ of network) {
		groups.push([]);
	}

	let latestTime = 0;
	for (const comparator of network) {
		const [i, j] = comparator;
		const maxTime = Math.max(times[i], times[j]);
		const myTime = maxTime + 1;
		times[i] = myTime;
		times[j] = myTime;
		groups[myTime].push(comparator);
	}

	const result = groups.filter(group => group.length != 0);

	return result;
}

async function moveDown() {
	const STEPS = Math.ceil(SWAP_MS / FRAME_TIME);
	const startPos = time
	const endPos = time + 1;
	for (let k = 0; k < STEPS; ++k) {
		const t = (k+1) / STEPS;
		time = startPos * (1-t) + endPos * t;
		await wait(FRAME_TIME);
	}
	time = endPos;
}

async function sort() {
	if (sorting) return;
	sorting = true;
	time = 0;
	const intervalId = window.setInterval(dibujar, FRAME_TIME);
	await wait(SWAP_MS);
	for (let k = 0; k < network.length; ++k) {
		const arr = network[k].map(cmp => doCompare(...cmp));
		await Promise.all(arr);
		await moveDown();
	}
	await wait(FRAME_TIME*2);
	window.clearInterval(intervalId);
	sorting = false;
}


function sortBtnClicked() {
	readNetwork();
	dibujar();
	sort();
}

function updateAutomaticState(state) {
	automatico = state;
}

function updateViewMode(mode) {
	viewMode = mode;
}


function automaticBtnClicked(evt) {
	updateAutomaticState(evt.target.checked);
}

function updateBtnClicked() {
	readNetwork();
	dibujar();
}

function modeListChanged(evt) {
	updateViewMode(evt.target.value);
	dibujar();
}

function shuffleBtnClicked() {
	init();
	dibujar();
}


document.getElementById("mezclar-btn").addEventListener("click", shuffleBtnClicked);
document.getElementById("update-btn").addEventListener("click", updateBtnClicked);
document.getElementById("correr-btn").addEventListener("click", sortBtnClicked);

const modeList = document.getElementById("view-dd");
modeList.addEventListener("change", modeListChanged);
updateViewMode(modeList.value);

const automaticBtn = document.getElementById("automatic-btn");
automaticBtn.addEventListener("click", automaticBtnClicked);
updateAutomaticState(automaticBtn.checked);

readNetwork();
init();
dibujar();

function runAutomatico() {
	if (automatico) {
		init();
		dibujar();
		sort();
	}
}


runAutomatico();
setInterval(runAutomatico, 6000);
