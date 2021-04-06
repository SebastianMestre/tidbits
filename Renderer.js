import { BLOCK_COUNT, ACCENT_COLOR, BG_COLOR } from './constants';

export class Renderer {
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
			xPos - padding,
			yPos - padding,
			BLOCK_X_SIZE + 2 * padding,
			pxHeight + 2 * padding);
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

	fillBackground() {
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}
}
