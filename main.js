const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const drawArray = (array, x0, y0, xs, ys) => {
	const n = array.length;
	for (let i = 0; i < n; ++i) {
		ctx.fillRect(
			x0 + i * xs / n,
			y0 + (1 - array[i]) * ys,
			xs / n,
			array[i] * ys);
	}
};

const drawInstructions = (program, pc, x0, y0, ys) => {
	const radius = 3;
	const textHeight = 20;
	const lineSpacing = 4;
	const lineHeight = textHeight + lineSpacing;

	ctx.font = `${textHeight}px monospace`;

	const show = [];
	for(let idx = pc - radius; idx <= pc + radius; ++idx){
		if(idx < 0 || idx >= program.length) show.push({});
		else show.push(program[idx]);
	}

	let ypos = y0;
	for(let i = 0; i < show.length; ++i){
		const line = JSON.stringify(show[i]);
		if (i != radius)
			ctx.fillText(line, x0, ypos + lineHeight);
		ypos += lineHeight;
	}

	ctx.fillStyle = "#fff";
	ctx.fillText(JSON.stringify(show[radius]), x0, y0 + (radius + 1) * lineHeight);
};

const draw = (machine, program) => {
	ctx.fillStyle = "#808";
	ctx.fillRect(0, 0, 800, 600);

	ctx.fillStyle = "#f0f";
	drawArray(machine.memory, 0, 0, 800, 600);

	ctx.fillStyle = "#000";
	drawInstructions(program, machine.state["PC"], 20, 20, 600);
};



const LD  = (dst, src1)       => ({ op: "LD",  dst, src1 });
const ST  = (dst, src1)       => ({ op: "ST",  dst, src1 });
const MOV = (dst, src1)       => ({ op: "MOV", dst, src1 });
const SET = (dst, imm)        => ({ op: "SET", dst, imm });
const ADD = (dst, src1, src2) => ({ op: "ADD", dst, src1, src2 });
const SUB = (dst, src1, src2) => ({ op: "SUB", dst, src1, src2 });

const JGE = (src1, imm)       => ({ op: "JGE", src1, imm });
const JG  = (src1, imm)       => ({ op: "JG" , src1, imm });
const JZ  = (src1, imm)       => ({ op: "JZ" , src1, imm });
const JL  = (src1, imm)       => ({ op: "JL" , src1, imm });
const JLE = (src1, imm)       => ({ op: "JLE", src1, imm });

const instructions = {
	"LD":  (machine, op) => { machine.state["PC"] += 1; machine.state[op.dst] = machine.memory[machine.state[op.src1]]; },
	"ST":  (machine, op) => { machine.state["PC"] += 1; machine.memory[machine.state[op.dst]] = machine.state[op.src1]; },
	"MOV": (machine, op) => { machine.state["PC"] += 1; machine.state[op.dst] = machine.state[op.src1]; },
	"SET": (machine, op) => { machine.state["PC"] += 1; machine.state[op.dst] = op.imm; },
	"ADD": (machine, op) => { machine.state["PC"] += 1; machine.state[op.dst] = machine.state[op.src1] + machine.state[op.src2]; },
	"SUB": (machine, op) => { machine.state["PC"] += 1; machine.state[op.dst] = machine.state[op.src1] - machine.state[op.src2]; },

	"JGE": (machine, op) => { machine.state["PC"] += 1; if (machine.state[op.src1] >= 0) machine.state["PC"] = op.imm; },
	"JG":  (machine, op) => { machine.state["PC"] += 1; if (machine.state[op.src1] >  0) machine.state["PC"] = op.imm; },
	"JZ":  (machine, op) => { machine.state["PC"] += 1; if (machine.state[op.src1] == 0) machine.state["PC"] = op.imm; },
	"JL":  (machine, op) => { machine.state["PC"] += 1; if (machine.state[op.src1] <  0) machine.state["PC"] = op.imm; },
	"JLE": (machine, op) => { machine.state["PC"] += 1; if (machine.state[op.src1] <= 0) machine.state["PC"] = op.imm; },
};

const step = (machine, program) => {
	const op = program[machine.state["PC"]];
	instructions[op.op](machine, op);
};

const shuffle = (array) => {
	for(let i = array.length; i--;){
		let r = Math.floor(Math.random() * (i+1));
		let t = array[i];
		array[i] = array[r];
		array[r] = t;
	}
	return array;
}

const N = 10;
const machine = {
	state: {
		A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
		PC: 0,
	},
	memory: shuffle([...new Array(N)].map((x,i,a) => (i+1)/a.length)),
	stack: [],
}

// bubble sort
const program = [
	SET("A", N),            // A = N
	SET("B", 1),            // B = 1
	// L0: 2
	SET("C", 0),            // C = 0
	// L1: 3
	LD("D", "C"),           // D = *C
	ADD("C", "C", "B"),     // C += 1
	LD("E", "C"),           // E = *C
	SUB("F", "E", "D"),     // F = E - D
	JG("F", /*L1E*/ 12),    // if(F>0) goto L1E // ie E > D
	ST("C", "D"),           // *C = D
	SUB("C", "C", "B"),     // C -= 1
	ST("C", "E"),           // *C = E
	ADD("C", "C", "B"),     // C += 1
	// L1E: 12
	SUB("F", "C", "A"),     // F = C - A
	ADD("F", "F", "B"),     // F = C+1 - A
	JL("F", /*L1*/ 3),      // if(F<0) goto L1 // ie C+1 < A
	SUB("A", "A", "B"),     // A -= 1
	JG("A", /*L0*/ 2),      // if(A>0) goto L0
];

const id = setInterval(() => {
	if(machine.state["PC"] >= program.length){
		clearInterval(id);
		return;
	}
	const op = program[machine.state["PC"]];
	step(machine, program);
	draw(machine, program);
}, 100);
