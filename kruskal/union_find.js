
export class union_find {
	constructor (size) {
		this.repr = [...new Array(size)].map((x,i)=>i);
	}
	join (a, b) {
		if(a == b) return;
		let ra = this.find(a);
		let rb = this.find(b);
		if(ra == rb) return;
		this.repr[ra] = this.repr[rb];
	}
	find (a) {
		if(this.repr[a] == a) return a;
		return this.repr[a] = this.find(this.repr[a]);
	}
	joined (a, b) {
		return this.find(a) == this.find(b);
	}
}
