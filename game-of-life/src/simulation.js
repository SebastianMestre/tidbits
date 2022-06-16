
export const make_grid = (width, height) => {
	return [...new Array(height)].map(() => [...new Array(width)].map(() => 0));
};

export const step = (grids) => {
	const height = grids[0].length;
	const width = grids[0][0].length;

	const rule = [
		[0, 0, 0, 1, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 0, 0, 0, 0, 0]
	];

	for (let i = 1; i < height-1; ++i) {
		for (let j = 1; j < width-1; ++j) {

			const cell_state = grids[0][i][j];

			let neighbor_sum = 0;
			neighbor_sum += grids[0][i-1][j-1];
			neighbor_sum += grids[0][i-1][j  ];
			neighbor_sum += grids[0][i-1][j+1];
			neighbor_sum += grids[0][i  ][j-1];
			neighbor_sum += grids[0][i  ][j+1];
			neighbor_sum += grids[0][i+1][j-1];
			neighbor_sum += grids[0][i+1][j  ];
			neighbor_sum += grids[0][i+1][j+1];

			grids[1][i][j] = rule[cell_state][neighbor_sum];
		}
	}

	let temp = grids[0];
	grids[0] = grids[1];
	grids[1] = temp;
};
