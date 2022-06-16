
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

export const draw = (machine, program) => {
	ctx.fillStyle = "#808";
	ctx.fillRect(0, 0, 800, 600);

	ctx.fillStyle = "#f0f";
	drawArray(machine.memory, 0, 0, 800, 600);

	ctx.fillStyle = "#000";
	drawInstructions(program, machine.state["PC"], 20, 20, 600);
};

