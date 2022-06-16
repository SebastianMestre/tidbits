import {union_find} from './union_find.js';
import {distsq, dist} from './geometry.js';
import {binary_search} from './algorithms.js';
import {point, batched_line} from './drawing.js';

let canvas;
let context;
let intervalID;

window.addEventListener("load", () => {
	setup();
	update();
	intervalID = window.setInterval(update, 10);
});

class Edge {
	constructor ( source, destination, weight ) {
		this.src = source;
		this.dst = destination;
		this.weight = weight;
	}
};

const BUILDING_VERTICES = "building vertices";
const BUILDING_EDGES = "building edges";
const SORTING_EDGES = "sorting edges";
const BUILDING_DATASTRUCTURES = "building data structures";
const BUILDING_TREE = "building tree";
const DONE = "done";

let VERTEX_COUNT = 100;
let EDGE_COUNT = 300;

// const MAX_WEIGHT = 100;
// const MIN_WEIGHT = -100;

let EDGE_LENGTH = 85;
let JITTER = 45;

let vertices = [];
let edges = [];

let state = BUILDING_VERTICES;
let completion = 0;

let vertex_idx = 0;
let edge_idx = 0;

let UF = null;
let keepers = [];

function setup () {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	vertices = [];
	edges = [];
	state = BUILDING_VERTICES;
	completion = 0;
	vertex_idx = 0;
	edge_idx = 0;
	UF = null;
	keepers = [];
};

function update () {

	if (state === BUILDING_VERTICES) {
		if ( vertex_idx === VERTEX_COUNT ) {
			state = BUILDING_EDGES;
			return;
		}

		const phi = (1+Math.sqrt(5))/2;

		// Build a jittered grid, this implies the following invariant
		// INVARIANT 1: vertices are almost sorted from left to right

		let x = vertex_idx / VERTEX_COUNT * canvas.width - canvas.width/2;
		let y = ((vertex_idx * phi * canvas.height) % canvas.height) - canvas.height / 2;

		x += JITTER * Math.random() - JITTER / 2;
		y += JITTER * Math.random() - JITTER / 2;

		y *= (canvas.height - 80) / canvas.height;
		x *= (canvas.width - 80) / canvas.width;

		vertex_idx++;
		completion = Math.floor(100 * vertex_idx / VERTEX_COUNT);
		vertices.push({x, y});
	}

	if ( state === BUILDING_EDGES ) {
		if ( edge_idx === EDGE_COUNT ) {
			edge_idx = 0;
			state = SORTING_EDGES;
			return;
		}

		let current = Math.floor(Math.random()*VERTEX_COUNT);

		const comp = (a, b)=> a.x < b;

		// INVARIANT 1 Allows us to do approximate binary search, which is good enough fo our purposes
		let lo = binary_search(vertices, 0, current, vertices[current].x-EDGE_LENGTH, comp);
		let hi = binary_search(vertices, current, VERTEX_COUNT, vertices[current].x+EDGE_LENGTH, comp);

		let options = [...new Array(hi-lo)]
			.map((_,id) => id+lo)
			.filter(id =>
				distsq(vertices[id], vertices[current]) < EDGE_LENGTH*EDGE_LENGTH);

		let r = (Math.random() * options.length)|0;
		let other = options[r];

		// let weight = Math.floor(MIN_WEIGHT + Math.random()*(MAX_WEIGHT - MIN_WEIGHT));
		let weight = dist(vertices[other], vertices[current]);

		edge_idx++;
		completion = Math.floor(100 * edge_idx / EDGE_COUNT);
		edges.push(new Edge(current, other, weight));
	}

	if ( state === SORTING_EDGES ) {
		if ( edge_idx === EDGE_COUNT ) {
			state = BUILDING_DATASTRUCTURES;
			return;
		}

		for (let j = edge_idx; j > 0; --j) {
			if (edges[j].weight < edges[j-1].weight) {
				let temp = edges[j];
				edges[j] = edges[j-1];
				edges[j-1] = temp;
			} else break;
		}

		edge_idx++;
		completion = Math.floor(100 * edge_idx / EDGE_COUNT);
	}

	if ( state === BUILDING_DATASTRUCTURES ) {

		UF = new union_find(VERTEX_COUNT);
		edge_idx = 0;
		keepers = [];

		state = BUILDING_TREE;
		return;
	}

	if ( state == BUILDING_TREE ) {
		if ( edge_idx === EDGE_COUNT ) {
			state = DONE;
			return;
		}

		let edge = edges[edge_idx];
		if (!UF.joined(edge.src, edge.dst)) {
			keepers.push(edge);
			UF.join(edge.src, edge.dst);
		}

		edge_idx++;
		completion = Math.floor(100 * edge_idx / EDGE_COUNT);
	}

	if ( state == DONE ) {
		window.clearInterval(intervalID);
	}

	draw();
};

function draw () {
	context.fillStyle = "#333";
	context.fillRect(0,0,canvas.width, canvas.height);

	context.lineWidth = 2;


	const styles = ["#111", "#222", "#444", "#555"];
	const K = 4;
	for (let k = 0; k < K; ++k) {
		context.strokeStyle = styles[k];
		context.beginPath();
		let lo = Math.floor(k * edges.length / K);
		let hi = Math.floor((k+1) * edges.length / K);
		for ( let i = lo; i < hi; ++i ) {
			let src = edges[i].src;
			let dst = edges[i].dst;
			let srcpos = vertices[src];
			let dstpos = vertices[dst];
			batched_line(srcpos.x, srcpos.y, dstpos.x, dstpos.y, context);
		}
		context.stroke();
	}

	context.strokeStyle = "rgb(196, 255, 128)";
	context.beginPath();
	for ( let i = 0; i < keepers.length; ++i ) {
		let src = keepers[i].src;
		let dst = keepers[i].dst;
		let srcpos = vertices[src];
		let dstpos = vertices[dst];
		batched_line(srcpos.x, srcpos.y, dstpos.x, dstpos.y, context);
	}
	context.stroke();

	context.fillStyle = "#FFF";
	for(let i = 0; i < vertices.length; ++i) {
		let {x, y} = vertices[i];
		point( x, y, 2, context );
	}

	context.font = "18px helvetica";
	context.fillStyle = "#666";
	context.fillText(state + "(" + completion + "%)", 0, 20);
}

function rerun () {
	let verticesInput = document.getElementById("vertices-input");
	let edgesInput = document.getElementById("edges-input");

	VERTEX_COUNT = Number(verticesInput.value);
	EDGE_COUNT = Number(edgesInput.value);

	window.clearInterval(intervalID);

	setup();
	update();
	intervalID = window.setInterval(update, 10);
}

document.getElementById("run-input")
	.addEventListener("click", rerun);
