
const base_ray_count = 16;
const cascade_count = 5;
let gw,gh;
let cascades;

function init(w, h) {

	gw = w;
	gh = h;
	cascades = [];

	const start = performance.now();

	const base_dist = 1 / (4 ** cascade_count - 1);
	console.log("base_dist", base_dist);

	for (let level = 0; level < cascade_count; ++level) {
		const cw = w >> level;
		const ch = h >> level;
		const ray_count = base_ray_count << (2*level);

		const grid = Array.from({length:(cw+1)*(ch+1)*ray_count*4}, () => 0);
		cascades.push(grid);

		const dx = [];
		const dy = [];
		for (let i = 0; i < ray_count; ++i) {
			dx.push(Math.cos(2 * Math.PI / ray_count * (i + 0.5)));
			dy.push(Math.sin(2 * Math.PI / ray_count * (i + 0.5)));
		}

		const start_dist = base_dist * 4 **  level      - base_dist;
		const end_dist   = base_dist * 4 ** (level + 1) - base_dist;

		for (let i = 0; i <= ch; ++i) {
			for (let j = 0; j <= cw; ++j) {

				const x = (j + 0.5) / cw;
				const y = 1 - (i + 0.5) / ch;

				for (let k = 0; k < ray_count; ++k) {

					const t = trace(x, y, dx[k], dy[k], start_dist, end_dist);

					for (let c = 0; c < 4; ++c) {
						put(level, i, j, k, c, t[c]);
					}
				}
			}
		}
	}

	for (let level = cascade_count - 2; level >= 0; --level) {

		const cw = w >> level;
		const ch = h >> level;
		const ray_count = base_ray_count << (2*level);

		const ncw = w >> (level + 1);
		const nch = h >> (level + 1);
		const nray_count = base_ray_count << (2*(level + 1));

		for (let i = 0; i <= ch; ++i) {
			for (let j = 0; j <= cw; ++j) {

				// image-space position
				const x =     (j + 0.5) / cw;
				const y = 1 - (i + 0.5) / ch;

				// top-left sample in next cascade
				const nj = Math.floor(     x  * ncw - 0.5);
				const ni = Math.floor((1 - y) * nch - 0.5);

				// sample-space distance to top-left sample
				const ex = (x - (nj+0.5)/ncw    ) * ncw;
				const ey = ((1-(ni+0.5)/nch) - y) * nch;

				// linear interpolation coeficients
				const cf = [(1-ex)*(1-ey), ex*(1-ey), (1-ex)*ey, ex*ey];

				// index offsets for gathering neighboring samples
				const di = [0, 0, 1, 1];
				const dj = [0, 1, 0, 1];


				for (let k = 0; k < ray_count; ++k) {
					const alpha = get(level, i, j, k, 3);

					for (let dk = 0; dk < 4; ++dk) {
						const nk = 4 * k + dk;

						for (let dp = 0; dp < 4; ++dp) {
							const nii = Math.max(0, Math.min(nch, ni + di[dp]));
							const njj = Math.max(0, Math.min(ncw, nj + dj[dp]));

							for (let c = 0; c < 3; ++c) {
								const val = get(level+1, nii, njj, nk, c);
								add(level, i, j, k, c, val * alpha * 0.25 * cf[dp]);
							}
						}

					}
				}
			}
		}
	}

	function get(level, i, j, k, c) {
		const cw = w >> level;
		const ray_count = base_ray_count << (2*level);
		const ray_idx = (i * (cw+1) + j) * ray_count + k;
		const idx = ray_idx * 4 + c;
		return cascades[level][idx];
	}

	function put(level, i, j, k, c, x) {
		const cw = w >> level;
		const ray_count = base_ray_count << (2*level);
		const ray_idx = (i * (cw+1) + j) * ray_count + k;
		const idx = ray_idx * 4 + c;
		cascades[level][idx] = x;
	}

	function add(level, i, j, k, c, x) {
		const cw = w >> level;
		const ray_count = base_ray_count << (2*level);
		const ray_idx = (i * (cw+1) + j) * ray_count + k;
		const idx = ray_idx * 4 + c;
		cascades[level][idx] += x;
	}

	const ending = performance.now();
	console.log("precomputed radiance cascade in", ending - start, "milliseconds");
}

function noise(x, y) {
	return Math.sin(x-1) + Math.cos(x - 3*y) - Math.sin(2*x + y);
}

function is_wall(x, y) {
	return noise(x * 10, y * 10) < -0.9;
}

// returns radiance in [r,g,b] 0..1 format
// it does this by raymarching the is_wall function
function trace(x, y, dx, dy, start_distance, end_distance) {
	let c = [0,0,0,0,0];

	const stride = 0.01;

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
		if (is_wall(xx, yy)) { hit = true; side = 4; break; }
		walked += stride;
		if (walked > end_distance) { side = 4; break; }
	}

	c[side] += 1;

	return [c[0]+c[3], c[1]+c[3], c[2]+c[3], Number(!hit)];
}

function color(x, y) {
	const out = [0,0,0];

	const level = 0;
	const cw = gw >> level;
	const ch = gh >> level;
	const j = Math.floor(x * cw);
	const i = Math.floor((1 - y) * ch);
	const ray_count = base_ray_count << (2*level);
	for (let k = 0; k < ray_count; ++k) {
		for (let c = 0; c < 3; ++c) {
			const idx = ((i * (cw+1) + j) * ray_count + k) * 4 + c;
			out[c] += cascades[level][idx];
		}
	}

	for (let c = 0; c < 3; ++c) {
		out[c] = 255 * (out[c] / ray_count) ** 0.45;
	}

	return out;
}

incremental(10, init, color);
