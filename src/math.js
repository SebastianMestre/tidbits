
export const logistic = (a,b,c) => x => a/(1+Math.exp(-c*(x-b)));

export const exponential = (a,b,c) => x => a*Math.exp(c*(x-b));
