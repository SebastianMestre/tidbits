
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

export const draw = (grid) => {
	const height = grid.length;
	const width = grid[0].length;

	ctx.fillStyle = '#e28';

	for (let i = 0; i < height; ++i) {
		for (let j = 0; j < width; ++j) {
			if (grid[i][j] == 1) {
				ctx.fillRect(
					j * cnv.width / width,
					i * cnv.height / height,
					cnv.width / width,
					cnv.height / height);
			}
		}
	}

	ctx.fillStyle = '#124';

	for (let i = 0; i < height; ++i) {
		for (let j = 0; j < width; ++j) {
			if (grid[i][j] == 0) {
				ctx.fillRect(
					j * cnv.width / width,
					i * cnv.height / height,
					cnv.width / width,
					cnv.height / height);
			}
		}
	}
};

