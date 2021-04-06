import { ACCENT_COLOR, FRAME_MILLIS, PRIMARY_LIGHT_COLOR, SECONDARY_LIGHT_COLOR, SECONDARY_DARK_COLOR } from './constants';
import { exchange, delay } from './utils';

const make_array = (data) => data.map(value => ({ value, state: 0, isHighlighted: false }));
class Animator {
	constructor(array, renderer) {
		this.backingArray = make_array(array);
		this.renderer = renderer;
		this.operations = [];
	}

	pushCompare(i, j) {
		this.operations.push({ op: "compare", i, j });
	}

	pushExchange(i, j) {
		this.operations.push({ op: "exchange", i, j });
	}

	pushAnimatedExchange(i, j) {
		this.operations.push({ op: "animated-exchange", i, j });
	}

	pushState(i, s) {
		this.operations.push({ op: "state", i, state: s });
	}

	pushRedraw() {
		this.operations.push({ op: "redraw" });
	}

	async play() {
		for (const op of this.operations) {
			if (op.op == "compare") {
				await this.compareVisual(op.i, op.j);
			} else if (op.op == "exchange") {
				exchange(this.backingArray, op.i, op.j);
				await this.exchangeVisual(op.i, op.j);
			} else if (op.op == "animated-exchange") {
				await this.animatedExchangeVisual(op.i, op.j);
				exchange(this.backingArray, op.i, op.j);
			} else if (op.op == "state") {
				this.backingArray[op.i].state = op.state;
			} else if (op.op == "redraw") {
				this.fillBackground();
				this.drawArray();
				await delay(FRAME_MILLIS);
			} else {
				console.warn("bad op", op);
			}
		}
	}

	async compareVisual(i, j) {
		this.fillBackground();
		this.backingArray[i].isHighlighted = true;
		this.backingArray[j].isHighlighted = true;
		this.drawArray();
		this.backingArray[i].isHighlighted = false;
		this.backingArray[j].isHighlighted = false;
		await delay(FRAME_MILLIS);
	}

	async exchangeVisual(i, j) {
		this.fillBackground();
		this.drawArray();
		await delay(FRAME_MILLIS);
	}

	async animatedExchangeVisual(i, j) {
		const ANIMATION_FRAMES = Math.ceil(FRAME_MILLIS / 20);
		const n = this.backingArray.length;
		const timeStep = FRAME_MILLIS / ANIMATION_FRAMES;
		for (let s = 0; s < ANIMATION_FRAMES; ++s) {
			this.fillBackground();

			for (let k = 0; k < n; ++k) {
				if (k == i || k == j)
					continue;
				this.drawItem(k);
			}

			const t = (s + 1) / (ANIMATION_FRAMES + 1);
			const xPosi = i * (1 - t) + j * t;
			const xPosj = j * (1 - t) + i * t;

			ctx.fillStyle = this.colorFromState(this.backingArray[i].state);
			this.renderer.drawElement(this.backingArray[i].value, xPosi);

			ctx.fillStyle = this.colorFromState(this.backingArray[j].state);
			this.renderer.drawElement(this.backingArray[j].value, xPosj);

			await delay(timeStep);
		}
	}

	fillBackground() {
		this.renderer.fillBackground();
	}

	drawArray() {
		const n = this.backingArray.length;
		for (let i = 0; i < n; ++i)
			this.drawItem(i);
	}

	drawItem(i) {
		const item = this.backingArray[i];
		ctx.fillStyle = this.colorFromState(item.state);
		this.drawRect(i, item.isHighlighted);
	}

	colorFromState(state) {
		return state == 0 ? PRIMARY_LIGHT_COLOR
			: state == 1 ? SECONDARY_LIGHT_COLOR
				: state == 2 ? SECONDARY_DARK_COLOR
					: state == 3 ? "transparent"
						: ACCENT_COLOR;
	}

	drawRect(i, isHighlighted = false) {
		const value = this.backingArray[i].value;
		this.renderer.drawElement(value, i, isHighlighted);
	}
}
export class OperationManager {
	constructor(array, renderer) {
		this.animator = new Animator(array, renderer);
		this.array = [...array];
	}

	compare(i, j) {
		this.animator.pushCompare(i, j);
		return this.array[i] - this.array[j];
	}

	exchange(i, j) {
		this.animator.pushExchange(i, j);
		exchange(this.array, i, j);
	}

	animatedExchange(i, j) {
		this.animator.pushAnimatedExchange(i, j);
		exchange(this.array, i, j);
	}

	slide(i, j) {
		if (i < j)
			throw "gtfo you punk ass";
		for (let k = i; k > j; --k) {
			this.animatedExchange(k - 1, k);
			this.setState(k, 1);
			this.redraw();
		}
	}

	setState(i, s) {
		this.animator.pushState(i, s);
	}

	redraw() {
		this.animator.pushRedraw();
	}

	async play() {
		await this.animator.play();
	}
}
