import { BLOCK_COUNT, ACCENT_COLOR, BG_COLOR } from './constants.js';

export class ScatterRenderer {
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

	fillBackground() {
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}

	drawRect(value, arrayPos) {
		const BLOCK_SIZE = Math.floor(canvas.width / (BLOCK_COUNT + 2));
		const SCREEN_BORDER = BLOCK_SIZE;

		const FULL_X_SPACE = BLOCK_SIZE * BLOCK_COUNT;

		const VALUE_Y_RATIO = (canvas.height - 2 * SCREEN_BORDER - BLOCK_SIZE) / (BLOCK_COUNT - 1);

		const X_OFFSET = Math.floor((canvas.width - FULL_X_SPACE) / 2);

		const PADDING = -BLOCK_SIZE/4;

		const yPosLow = (value - 1) * VALUE_Y_RATIO;

		let xPos = X_OFFSET + arrayPos * BLOCK_SIZE;
		const yPos = Math.floor(cnv.height - SCREEN_BORDER - yPosLow - BLOCK_SIZE);

		ctx.fillRect(
			xPos - PADDING,
			yPos - PADDING,
			BLOCK_SIZE + 2 * PADDING,
			BLOCK_SIZE + 2 * PADDING);
	}
}
