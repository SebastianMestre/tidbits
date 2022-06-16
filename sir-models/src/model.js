
export const model = (initialState, stepFunction, valueFunction, color) => ({
	state: initialState,
	step(timeStep) {
		this.state = stepFunction(this.state, timeStep);
	},
	value () {
		return valueFunction(this.state);
	},
	color: color
});
