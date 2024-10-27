
const base_ray_count = 4;
const cascade_count = 6;
let gw, gh;
let cascades;

function init(w, h) {

	gw = w;
	gh = h;
	cascades = Array.from({length: cascade_count}, () => null);

	const start = performance.now();

	const base_dist = 1.5 / 4 ** cascade_count;
	console.log("base_dist", base_dist);

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

		for (let i = 0; i < ch; ++i) {
			for (let j = 0; j < cw; ++j) {

				const x =     (j + 0.5) * probe_size / w;
				const y = 1 - (i + 0.5) * probe_size / h;

				const probe_idx_premul = (i * cw + j) * ray_count;

				for (let k = 0; k < ray_count; ++k) {

					const ray_idx_premul = (probe_idx_premul + k) * 4;
					const t = trace(x, y, dx[k], dy[k], start_dist, end_dist);

					for (let c = 0; c < 4; ++c) {
						cascades[level][ray_idx_premul + c] = t[c];
					}
				}
			}
		}

		if (level == cascade_count-1) continue;

		const nprobe_size = 1 << (level + 1);
		const ncw = (w + nprobe_size - 1) >> (level + 1);
		const nch = (h + nprobe_size - 1) >> (level + 1);
		const nray_count = base_ray_count << (2*(level + 1));

		for (let i = 0; i < ch; ++i) {
			for (let j = 0; j < cw; ++j) {

				const probe_idx_premul = (i * cw + j) * ray_count;

				// image-space position
				const x =     (j + 0.5) * probe_size / w;
				const y = 1 - (i + 0.5) * probe_size / h;

				// top-left sample in next cascade
				const nj = ((j + 1) >> 1) - 1;
				const ni = ((i + 1) >> 1) - 1;

				const nx =     (nj + 0.5) * nprobe_size / w;
				const ny = 1 - (ni + 0.5) * nprobe_size / h;

				// sample-space distance to top-left sample
				const ex = (x - nx) * w / nprobe_size;
				const ey = (ny - y) * h / nprobe_size;

				// linear interpolation coeficients
				const cf = [(1-ex)*(1-ey), ex*(1-ey), (1-ex)*ey, ex*ey];

				// index offsets for gathering neighboring samples
				const di = [0, 0, 1, 1];
				const dj = [0, 1, 0, 1];

				for (let k = 0; k < ray_count; ++k) {
					const ray_idx_premul = (probe_idx_premul + k) * 4;
					const alpha = cascades[level][ray_idx_premul + 3];

					for (let dk = 0; dk < 4; ++dk) {
						const nk = 4 * k + dk;

						for (let dp = 0; dp < 4; ++dp) {
							const nii = Math.max(0, Math.min(nch-1, ni + di[dp]));
							const njj = Math.max(0, Math.min(ncw-1, nj + dj[dp]));
							const nray_idx_premul = ((nii * ncw + njj) * nray_count + nk) * 4;
							const coef = cf[dp] * alpha * 0.25;

							for (let c = 0; c < 3; ++c) {
								cascades[level][ray_idx_premul + c] += cascades[level+1][nray_idx_premul + c] * coef;
							}
						}
					}
				}
			}
		}
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

	const stride = 0.0016;

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
			const idx = ((i * cw + j) * ray_count + k) * 4 + c;
			out[c] += cascades[level][idx];
		}
	}

	for (let c = 0; c < 3; ++c) {
		out[c] = 255 * (out[c] / ray_count) ** 0.45;
	}

	return out;
}

incremental(10, init, color);
