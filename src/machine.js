export const LD  = (dst, src1)       => ({ op: "LD",  dst, src1 });
export const ST  = (dst, src1)       => ({ op: "ST",  dst, src1 });
export const MOV = (dst, src1)       => ({ op: "MOV", dst, src1 });
export const SET = (dst, imm)        => ({ op: "SET", dst, imm });
export const ADD = (dst, src1, src2) => ({ op: "ADD", dst, src1, src2 });
export const SUB = (dst, src1, src2) => ({ op: "SUB", dst, src1, src2 });

export const JGE = (src1, imm)       => ({ op: "JGE", src1, imm });
export const JG  = (src1, imm)       => ({ op: "JG" , src1, imm });
export const JZ  = (src1, imm)       => ({ op: "JZ" , src1, imm });
export const JL  = (src1, imm)       => ({ op: "JL" , src1, imm });
export const JLE = (src1, imm)       => ({ op: "JLE", src1, imm });

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

export const step = (machine, program) => {
	const op = program[machine.state["PC"]];
	instructions[op.op](machine, op);
};

export const makeMachine = (memory) => ({
	state: {
		A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
		PC: 0,
	},
	memory,
	stack: [],
})
