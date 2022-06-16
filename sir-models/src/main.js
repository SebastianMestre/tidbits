import {exponentialDisease, logisticDisease} from './disease.js';
import {model} from './model.js';

const population = 44.27 * 1e6;
const initialInfected = 502;
const initialRemoved = 8 + 63;
const initialSusceptible = population - initialInfected - initialRemoved;

let duplicationRate = 5;
let infectionRate = Math.log(2)/duplicationRate;
let infection = infectionRate / population;
let R0 = 3;
let recoveryRate = infectionRate / R0;


const models = [];
function init () {
	models.length = 0;

	models.push(model(
		{time: 0},
		({time}, dt) => ({'time':time+dt}),
		({time}) => exponentialDisease(
			population,
			duplicationRate,
			recoveryRate,
			initialInfected / population
		)(time),
		"#f00"
	))

	models.push(model(
		{time: 0},
		({time}, dt) => ({'time':time+dt}),
		({time}) => logisticDisease(
			population,
			duplicationRate,
			recoveryRate,
			initialInfected / population
		)(time),
		"#0f0"
	))

	const SIRinit = {
		'S': initialSusceptible,
		'I': initialInfected,
		'R': initialRemoved
	};

	const SIRstep = ({S,I,R}, dt) => ({
		'S': S - S*I*infection*dt,
		'I': I + S*I*infection*dt - I*recoveryRate*dt,
		'R': R + I*recoveryRate*dt
	});

	models.push(model({...SIRinit}, SIRstep, ({S}) => S, "#28f"));
	models.push(model({...SIRinit}, SIRstep, ({I}) => I, "#a2f"));
	models.push(model({...SIRinit}, SIRstep, ({R}) => R, "#2fd"));
}

// ******************

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const totalTimeSteps = 400;
const finalTime = 365;
const maxY = population;
const dt = finalTime / totalTimeSteps;
 
const gridStep = 30;
const gridPoints = Math.floor(finalTime / gridStep);

function plot(){
	ctx.strokeStyle = '#555';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for(let i = 1; i < gridPoints; ++i){
		let x = i * canvas.width / gridPoints;

		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}
	ctx.moveTo(0, canvas.height *(1-population/maxY))
	ctx.lineTo(canvas.width, canvas.height *(1-population/maxY));
	let hospital = population * 0.1;
	ctx.moveTo(0, canvas.height *(1-hospital/maxY))
	ctx.lineTo(canvas.width, canvas.height *(1-hospital/maxY));
	ctx.stroke();

	ctx.lineWidth = 3;

	for(let i = 0; i < totalTimeSteps; ++i){

		for(let model of models){
			const y0 = model.value();
			model.step(dt);
			const y1 = model.value();

			const y0Canvas = canvas.height - y0 * canvas.height / maxY;
			const y1Canvas = canvas.height - y1 * canvas.height / maxY;
			const x0Canvas = i * canvas.width / totalTimeSteps;
			const x1Canvas = (i+1) * canvas.width / totalTimeSteps;

			ctx.strokeStyle = model.color;
			ctx.beginPath();
			ctx.moveTo(x0Canvas, y0Canvas);
			ctx.lineTo(x1Canvas, y1Canvas);
			ctx.stroke();
		}

	}
}

init();
plot();

function replot() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	init();
	plot();
}

let minInfectvity = 0.1;
let maxInfectvity = 0.3;

let minR0 = 1;
let maxR0 = 5;

function clamp (x, min, max) {
	x = x < min ? min : x;
	x = x > max ? max : x;
	return x;
}

function updateDisplays () {
	duplicationDisplay.innerHTML = duplicationRate.toFixed(2);
	infectivityDisplay.innerHTML = infectionRate.toFixed(2);
	r0Display.innerHTML = R0.toFixed(2);
	recoveryDisplay.innerHTML = recoveryRate.toFixed(2);

	duplicationSlider.value = duplicationRate;
	infectivitySlider.value = infectionRate;
	r0Slider.value = R0;
	recoverySlider.value = recoveryRate;
}

duplicationSlider.addEventListener("input", function () {
	duplicationRate = Number(duplicationSlider.value);
	infectionRate = Math.log(2)/duplicationRate;
	infection = infectionRate / population;

	recoverySlider.max = infectionRate / minR0;
	recoverySlider.min = infectionRate / maxR0;
	recoveryRate = clamp(
		recoveryRate,
		Number(recoverySlider.min),
		Number(recoverySlider.max)
	);

	R0 = infectionRate / recoveryRate;

	updateDisplays();
	replot();
})

infectivitySlider.addEventListener("input", function () {
	infectionRate = Number(infectivitySlider.value);
	infection = infectionRate / population;
	duplicationRate = Math.log(2)/infectionRate;

	recoverySlider.max = infectionRate / minR0;
	recoverySlider.min = infectionRate / maxR0;
	recoveryRate = clamp(
		recoveryRate,
		Number(recoverySlider.min),
		Number(recoverySlider.max)
	);

	R0 = infectionRate / recoveryRate;

	updateDisplays();
	replot();
})

r0Slider.addEventListener("input", function () {
	R0 = Number(r0Slider.value);
	recoveryRate = infectionRate / R0;

	updateDisplays();
	replot();
})

recoverySlider.addEventListener("input", function () {
	recoveryRate = Number(recoverySlider.value);
	R0 = infectionRate / recoveryRate;

	updateDisplays();
	replot();
})
