
const base_ray_count = 4;
const cascade_count = 6;
let gw, gh;
let cascades;

function init(w, h) {

	gw = w;
	gh = h;
	cascades = Array.from({length: cascade_count}, () => null);

	const base_dist = 1.5 / 4 ** cascade_count;

	const total_start = performance.now();

	for (let level = cascade_count-1; level >= 0; --level) {

		const probe_size = 1 << level;
		const cw = (w + probe_size - 1) >> level;
		const ch = (h + probe_size - 1) >> level;
		const ray_count = base_ray_count << (2*level);

		const grid = Array.from({length:cw*ch*ray_count*4}, () => 0);
		cascades[level] = grid;

		const dx = [];
		const dy = [];
		for (let i = 0; i < ray_count; ++i) {
			dx.push(Math.cos(2 * Math.PI / ray_count * (i + 0.5)));
			dy.push(Math.sin(2 * Math.PI / ray_count * (i + 0.5)));
		}

		const start_dist = level == 0 ? 0 : base_dist * 4 **  level;
		const end_dist   =                  base_dist * 4 ** (level + 1);

		// const tracing_start = performance.now();

		for (let i = 0; i < ch; ++i) {
			for (let j = 0; j < cw; ++j) {

				const x =     (j + 0.5) * probe_size / w;
				const y = 1 - (i + 0.5) * probe_size / h;

				const probe_idx_premul = (i * cw + j) * ray_count;

				for (let k = 0; k < ray_count; ++k) {

					const ray_idx_premul = (probe_idx_premul + k) * 4;
					const t = trace(x, y, dx[k], dy[k], start_dist, end_dist);

					for (let c = 0; c < 4; ++c) {
						grid[ray_idx_premul + c] = t[c];
					}
				}
			}
		}

		// const tracing_ending = performance.now();

		if (level == cascade_count-1) continue;

		const ngrid = cascades[level+1];
		const nprobe_size = 1 << (level + 1);
		const ncw = (w + nprobe_size - 1) >> (level + 1);
		const nch = (h + nprobe_size - 1) >> (level + 1);
		const nray_count = base_ray_count << (2*(level + 1));

		// index offsets for gathering neighboring probes
		const di = [0, 0, 1, 1];
		const dj = [0, 1, 0, 1];

		// linear interpolation coeficients
		const coefficients = [
			[ 0.0625, 0.1875, 0.1875, 0.5625 ],
			[ 0.1875, 0.0625, 0.5625, 0.1875 ],
			[ 0.1875, 0.5625, 0.0625, 0.1875 ],
			[ 0.5625, 0.1875, 0.1875, 0.0625 ],
		];

		// const gather_start = performance.now();

		for (let i = 0; i < ch; ++i) {
			for (let j = 0; j < cw; ++j) {

				const probe_idx_premul = (i * cw + j) * ray_count;

				// top-left probe in next cascade
				const nj = ((j + 1) >> 1) - 1;
				const ni = ((i + 1) >> 1) - 1;

				const cf = coefficients[((i&1)<<1)|(j&1)];

				for (let k = 0; k < ray_count; ++k) {
					const ray_idx_premul = (probe_idx_premul + k) * 4;
					const alpha = grid[ray_idx_premul + 3];
					for (let dp = 0; dp < 4; ++dp) {
						const nii = Math.max(0, Math.min(nch-1, ni + di[dp]));
						const njj = Math.max(0, Math.min(ncw-1, nj + dj[dp]));
						const nprobe_idx_premul = (nii * ncw + njj) * nray_count;
						const coef = cf[dp] * alpha * 0.25;
						for (let dk = 0; dk < 4; ++dk) {
							const nk = 4 * k + dk;
							const nray_idx_premul = (nprobe_idx_premul + nk) * 4;

							for (let c = 0; c < 3; ++c) {
								grid[ray_idx_premul + c] += ngrid[nray_idx_premul + c] * coef;
							}
						}
					}
				}
			}
		}

		// const gather_ending = performance.now();

		// console.log("did tracing in", tracing_ending - tracing_start, "ms", "and gathering in", gather_ending - gather_start, "ms");
	}


	const total_ending = performance.now();

	console.log("did initialization in", total_ending - total_start, "ms");


}

// returns radiance in [r,g,b] 0..1 format
// it does this by ball-tracing a lipschitz function
function trace(x, y, dx, dy, start_distance, end_distance) {
	let c = [0,0,0,0,0];

	let hit = false;
	let walked = start_distance;
	let side;
	while (true) {
		const xx = x+walked*dx;
		const yy = y+walked*dy;
		if (xx < 0) { hit = true; side = 0; break; }
		if (xx > 1) { hit = true; side = 1; break; }
		if (yy < 0) { hit = true; side = 2; break; }
		if (yy > 1) { hit = true; side = 3; break; }

		const d = sdf(xx, yy);
		if (d < 0.002) { hit = true; side = 4; break; }

		walked += d;
		if (walked > end_distance) { side = 4; break; }
	}

	c[side] += 1;

	return [c[0]+c[3], c[1]+c[3], c[2]+c[3], Number(!hit)];

	function sdf(x, y) {
		return Math.min(
			(Math.sin(10*x-1) + Math.cos(10*x - 30*y) - Math.sin(20*x + 10*y) + 0.9) / 80,
			Math.min(1.1 - Math.abs(x), 1.1 - Math.abs(y)));
	}
}

function color(x, y) {
	const out = [0,0,0];

	const level = 0;
	const probe_size = 1 << level;
	const cw = (gw + probe_size - 1) >> level;
	const ch = (gh + probe_size - 1) >> level;
	const grid = cascades[level];
	const j = Math.floor(x * cw);
	const i = Math.floor((1 - y) * ch);
	const ray_count = base_ray_count << (2*level);
	const probe_idx_premul = (i * cw + j) * ray_count;
	for (let k = 0; k < ray_count; ++k) {
		const ray_idx_premul = (probe_idx_premul + k) * 4;
		for (let c = 0; c < 3; ++c) {
			const idx = ray_idx_premul + c;
			out[c] += grid[idx];
		}
	}

	for (let c = 0; c < 3; ++c) {
		out[c] /= ray_count;
		out[c] = out[c] / (out[c] + 1);
		out[c] = 255 * out[c] ** 0.45;
	}

	return out;
}

incremental(10, init, color);
