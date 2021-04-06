import { BLOCK_COUNT } from './constants';
import { shuffle } from './utils';
import { ScatterRenderer } from './ScatterRenderer';
import { OperationManager } from './OperationManager';

cnv = document.getElementById("canvas");
ctx = cnv.getContext("2d");

const insertionSort = (manager) => {
	const n = manager.array.length;
	for (let i = 1; i < n; ++i) {

		for (let j = 0; j < i; ++j)
			manager.setState(j, 1);
		manager.redraw();

		let j = i;
		for (; j > 0; --j) {
			if (manager.compare(j - 1, i) > 0) {
				manager.setState(j - 1, 2);
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
	const arr = shuffle([...Array(BLOCK_COUNT)].map((x, i) => i + 1));
	const manager = new OperationManager(arr, new ScatterRenderer);

	insertionSort(manager);

	await manager.play();
})();
