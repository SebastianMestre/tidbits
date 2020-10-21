import {LD, ST, SET, ADD, SUB, JL, JG, step, makeMachine} from './machine.js';
import {draw} from './drawing.js';

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
const machine = makeMachine(shuffle([...new Array(N)].map((x,i,a) => (i+1)/a.length)));

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
