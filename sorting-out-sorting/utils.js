export const exchange = (arr, i, j) => {
	const temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
};
export const shuffle = arr => {
	for (let i = arr.length; i-- > 0;) {
		const r = Math.floor(Math.random() * i);
		exchange(arr, i, r);
	}
	return arr;
};
export const delay = (millis) => new Promise((success) => setTimeout(success, millis));