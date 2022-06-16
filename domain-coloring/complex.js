
export const times = (a, b) => ({
	re : a.re * b.re - a.im * b.im,
	im : a.im * b.re + a.re * b.im
});

export const plus = (a, b) => ({
	re : a.re + b.re,
	im : a.im + b.im
});

export const minus = (a, b) => ({
	re : a.re - b.re,
	im : a.im - b.im
});

export const overReal = (a, b) => ({
	re : a.re / b,
	im : a.im / b
});

export const compl = ({re,im}) => ({re,im:-im});

export const over = (a, b) => overReal(times(a, compl(b)), times(b, compl(b)).re);

export const square = a => times(a, a);

export const real = (x) => ({re:x, im:0});
export const imag = (x) => ({re:0, im:x});
export const comp = (a,b) => ({re:a, im:b});

export const Cpx = {
	compl,
	times,
	plus,
	over,
	square,
	overReal,
	minus,
	real,
	imag,
	comp
};

