
export function binary_search (arr, first, last, val, comp) {
	comp = comp || ((a,b)=>a<b);
	while(first != last){
		let m = (first+last)>>1;
		if(comp(arr[m], val)){
			first = m+1;
		}else{
			last = m;
		}
	}
	return last;
}
