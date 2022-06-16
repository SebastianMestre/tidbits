const point = (x, y, vx, vy) => ({ x, y, vx, vy });
const copy_point = ({ x, y, vx, vy }) => ({ x, y, vx, vy });
const equal_points = (p1, p2) => p1.x == p2.x && p1.y == p2.y && p1.vx == p2.vx && p1.vy == p2.vy;
const turn_point = ({ x, y, vx, vy }) => point(y, -x, vy, -vx);

const cnv = document.getElementById('cnv');
const ctx = cnv.getContext('2d');

const DT = 0.01;
const R = 1;


let points;
const init = p => {
	points = [p];
	for (let i = 0; i < 3; ++i)
		points.push(turn_point(points[i]));
};
init(point(1, 0, 0, 1));

const randomize = () => {
	init(point(Math.random(), Math.random(), Math.random(), Math.random()));
};

const gravity_acceleration = (p1, p2) => {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	const r2 = dx*dx + dy*dy;
	const r3 = r2 * Math.sqrt(r2);
	return [dx / r3, dy / r3];
};

const is_symmetrical = ps => {
	return equal_points(turn_point(ps[0]), ps[1]) &&
	       equal_points(turn_point(ps[1]), ps[2]) &&
	       equal_points(turn_point(ps[2]), ps[3]);
};

const next = ps => {
	const n = ps.length;

	const qs = [];

	for (let i = 0; i < n; ++i) {

		let p1 = ps[i];
		qs.push(copy_point(p1));

		for (let j = 1; j < n; ++j) {
			let p2 = ps[(i+j)%n];

			const [ax, ay] = gravity_acceleration(p1, p2);

			qs[i].vx += ax * DT;
			qs[i].vy += ay * DT;
		}
	}

	for (let i = 0; i < n; ++i) {
		qs[i].x += qs[i].vx * DT;
		qs[i].y += qs[i].vy * DT;
	}

	return qs;
};

const draw = ps => {
	const n = ps.length;

	const xoff = cnv.width / 2;
	const yoff = cnv.height / 2;
	const zoom = Math.min(xoff, yoff) * 0.6;

	// ctx.clearRect(0, 0, cnv.width, cnv.height);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
	ctx.fillRect(0, 0, cnv.width, cnv.height);

	ctx.fillStyle = 'black';
	for (let i = 0; i < n; ++i) {
		const x = ps[i].x * zoom + xoff - R;
		const y = ps[i].y * zoom + yoff - R;
		ctx.fillRect(x, y, R+R, R+R);
	}
};

let frame = 0;
const update = () => {
	if (frame % 100 == 0) {
		console.log(is_symmetrical(points));
	}

	points = next(points);
	draw(points);
	points = next(points);
	draw(points);
	points = next(points);
	draw(points);
	points = next(points);
	draw(points);
	frame += 1;
};

console.log(cnv);
update();
window.setInterval(update, 10);

document.getElementById('btn-randomize').addEventListener('click', e => {
	ctx.clearRect(0,0,cnv.width,cnv.height);
	randomize();
});
