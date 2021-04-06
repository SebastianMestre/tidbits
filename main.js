
cnv = document.getElementById("canvas");
ctx = cnv.getContext("2d");

const BG_COLOR = "#111";

const PRIMARY_LIGHT_COLOR = "#0a3";
const PRIMARY_DARK_COLOR = "#073";

const SECONDARY_LIGHT_COLOR = "#f00";
const SECONDARY_DARK_COLOR = "#333";

const ACCENT_COLOR = "#ff0";

const FRAME_MILLIS = 100;

const BLOCK_COUNT = 38;

const delay = (millis) => new Promise((success) => setTimeout(success, millis));

const make_array = (data) => data.map(value => ({value, state: 0, isHighlighted: false}));

const exchange = (arr, i, j) => {
	const temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
};

const shuffle = arr => {
	for(let i = arr.length; i-->0;){
		const r = Math.floor(Math.random() * i);
		exchange(arr, i, r);
	}
	return arr;
};

class Renderer {
	drawRect(height, arrayPos, padding) {
		const BLOCK_X_SIZE = Math.floor(canvas.width / BLOCK_COUNT / 4);
		const BLOCK_X_MARGIN = BLOCK_X_SIZE * 3;

		const FULL_X_SPACE = (BLOCK_X_SIZE + BLOCK_X_MARGIN) * BLOCK_COUNT - BLOCK_X_MARGIN;
		const X_OFFSET = Math.floor((canvas.width - FULL_X_SPACE) / 2);

		const VALUE_Y_RATIO = canvas.height / (BLOCK_COUNT + 1);
		const Y_OFFSET = cnv.height - BLOCK_X_SIZE;

		const HIGHLIGHT_THICKNESS = BLOCK_X_SIZE / 2;
		padding = Math.ceil(padding * HIGHLIGHT_THICKNESS);

		const xPos = X_OFFSET + arrayPos * (BLOCK_X_SIZE + BLOCK_X_MARGIN);

		const pxHeight = Math.floor(height * VALUE_Y_RATIO);
		const yPos = Y_OFFSET - pxHeight;

		ctx.fillRect(
			xPos         -   padding,
			yPos         -   padding,
			BLOCK_X_SIZE + 2*padding,
			pxHeight     + 2*padding);
	}

	drawElement(value, position, isHighlighted = false) {
		if (isHighlighted) {
			const oldColor = ctx.fillStyle;
			ctx.fillStyle = ACCENT_COLOR;
			this.drawRect(value, position, 1);
			ctx.fillStyle = oldColor;
		}
		this.drawRect(value, position, 0);
	}

	fillBackground () {
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}
}

class VertRenderer {
	drawRect(height, arrayPos, padding) {
		const BLOCK_Y_SIZE = Math.floor(canvas.height / BLOCK_COUNT / 4);
		const BLOCK_Y_MARGIN = BLOCK_Y_SIZE * 3;

		const FULL_Y_SPACE = (BLOCK_Y_SIZE + BLOCK_Y_MARGIN) * BLOCK_COUNT - BLOCK_Y_MARGIN;
		const Y_OFFSET = Math.floor((canvas.height - FULL_Y_SPACE) / 2);

		const HIGHLIGHT_THICKNESS = BLOCK_Y_SIZE / 2;
		padding = Math.ceil(padding * HIGHLIGHT_THICKNESS);

		const yPos = Y_OFFSET + arrayPos * (BLOCK_Y_SIZE + BLOCK_Y_MARGIN);

		const VALUE_X_RATIO = canvas.width / (BLOCK_COUNT + 1);

		const xSize = Math.round(height * VALUE_X_RATIO);
		const xPos = Math.floor((cnv.width - xSize) / 2);

		ctx.fillRect(
			xPos         -   padding,
			yPos         -   padding,
			xSize        + 2*padding,
			BLOCK_Y_SIZE + 2*padding);
	}

	drawElement(value, position, isHighlighted = false) {
		if (isHighlighted) {
			const oldColor = ctx.fillStyle;
			ctx.fillStyle = ACCENT_COLOR;
			this.drawRect(value, position, 1);
			ctx.fillStyle = oldColor;
		}
		this.drawRect(value, position, 0);
	}

	fillBackground () {
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}
}

class ScatterRenderer {
	drawElement(value, position, isHighlighted = false) {
		if (isHighlighted) {
			const oldColor = ctx.fillStyle;
			ctx.fillStyle = ACCENT_COLOR;
			this.drawRect(value, position);
			ctx.fillStyle = oldColor;
		} else {
			this.drawRect(value, position);
		}
	}

	fillBackground () {
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}

	drawRect(value, arrayPos) {
		const BLOCK_SIZE = 20;
		// const BLOCK_SIZE = Math.floor(canvas.width / (BLOCK_COUNT + 2));
		const SCREEN_BORDER = BLOCK_SIZE; // BLOCK_SIZE;

		const FULL_X_SPACE = BLOCK_SIZE * BLOCK_COUNT;

		const VALUE_Y_RATIO = (canvas.height - 2 * SCREEN_BORDER - BLOCK_SIZE) / (BLOCK_COUNT - 1);

		const X_OFFSET = Math.floor((canvas.width - FULL_X_SPACE) / 2);

		const PADDING = 0;

		const yPosLow = (value - 1) * VALUE_Y_RATIO;

		let xPos = X_OFFSET + arrayPos * BLOCK_SIZE;
		const yPos = Math.floor(cnv.height - SCREEN_BORDER - yPosLow - BLOCK_SIZE);

		ctx.fillRect(
			xPos       -   PADDING,
			yPos       -   PADDING,
			BLOCK_SIZE + 2*PADDING,
			BLOCK_SIZE + 2*PADDING);
	}
}

class Animator {
	constructor(array, renderer) {
		this.backingArray = make_array(array);
		this.renderer = renderer;
		this.operations = [];
	}

	pushCompare(i, j) {
		this.operations.push({ op: "compare", i, j})
	}

	pushExchange(i, j) {
		this.operations.push({ op: "exchange", i, j})
	}

	pushAnimatedExchange(i, j) {
		this.operations.push({ op: "animated-exchange", i, j})
	}

	pushState(i, s) {
		this.operations.push({ op: "state", i, state: s });
	}

	pushRedraw() {
		this.operations.push({ op: "redraw" });
	}

	async play() {
		for (const op of this.operations) {
			if (op.op == "compare"){
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
		const timeStep = FRAME_MILLIS/ANIMATION_FRAMES;
		for (let s = 0; s < ANIMATION_FRAMES; ++s) {
			this.fillBackground();

			for (let k = 0; k < n; ++k) {
				if (k == i || k == j) continue;
				this.drawItem(k);
			}

			const t = (s+1) / (ANIMATION_FRAMES+1);
			const xPosi = i * (1-t) + j * t;
			const xPosj = j * (1-t) + i * t;

			ctx.fillStyle = this.colorFromState(this.backingArray[i].state);
			this.renderer.drawElement(this.backingArray[i].value, xPosi);

			ctx.fillStyle = this.colorFromState(this.backingArray[j].state);
			this.renderer.drawElement(this.backingArray[j].value, xPosj);

			await delay(timeStep);
		}
	}

	fillBackground () {
		this.renderer.fillBackground()
	}

	drawArray () {
		const n = this.backingArray.length;
		for (let i = 0; i < n; ++i)
			this.drawItem(i);
	}

	drawItem (i) {
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

	drawRect (i, isHighlighted = false) {
		const value = this.backingArray[i].value;
		this.renderer.drawElement(value, i, isHighlighted);
	}
}

class OperationManager {
	constructor(array, renderer) {
		this.animator = new Animator(array, renderer);
		this.array = [...array];
	}

	compare(i, j) {
		this.animator.pushCompare(i, j);
		return this.array[i]- this.array[j];
	}

	exchange (i, j) {
		this.animator.pushExchange(i, j);
		exchange(this.array, i, j);
	}

	animatedExchange (i, j) {
		this.animator.pushAnimatedExchange(i, j);
		exchange(this.array, i, j);
	}

	slide (i, j) {
		if (i < j) throw "gtfo you punk ass";
		for (let k = i; k > j; --k) {
			this.animatedExchange(k-1, k);
			this.setState(k, 1);
			this.redraw();
		}
	}

	setState(i, s) {
		this.animator.pushState(i, s);
	}

	redraw() {
		this.animator.pushRedraw()
	}

	async play() {
		await this.animator.play();
	}
}

const insertionSort = (manager) => {
	const n = manager.array.length;
	for (let i = 1; i < n; ++i) {

		for (let j = 0; j < i; ++j)
			manager.setState(j, 1);
		manager.redraw();

		let j = i;
		for (; j > 0; --j) {
			if (manager.compare(j-1, i) > 0) {
				manager.setState(j-1, 2);
			} else {
				break;
			}
		}

		manager.setState(i, 3);
		manager.slide(i, j);
		manager.setState(j, 1);
		manager.redraw();
	}
};

(async () => {
	// const arr = [2,4,6,3,1,7,5];
	const arr = shuffle([...Array(BLOCK_COUNT)].map((x,i)=>i+1));
	const manager = new OperationManager(arr, new ScatterRenderer);

	insertionSort(manager);

	await manager.play();
})();
