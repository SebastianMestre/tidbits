import {logistic, exponential} from './math.js';

export const logisticDisease = (pop, dupRate, recovRate, initPerc) => {
	const a = pop;
	const c = Math.log(2)/dupRate-recovRate;
	const b = - Math.log(initPerc) / c;
	return logistic(a, b, c);
}

export const exponentialDisease = (pop, dupRate, recovRate, initPerc) => {
	const a = pop;
	const c = Math.log(2)/dupRate-recovRate;
	const b = - Math.log(initPerc) / c;
	return exponential(a, b, c);
}
