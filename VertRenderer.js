import { BLOCK_COUNT, ACCENT_COLOR, BG_COLOR } from './constants';

export class VertRenderer {
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
			xPos - padding,
			yPos - padding,
			xSize + 2 * padding,
			BLOCK_Y_SIZE + 2 * padding);
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
