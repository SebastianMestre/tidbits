const share = document.getElementById('ShareLink');
const input = document.getElementById('MathInput');
const output = document.getElementById('MathPreview');
const update = function(){
	const content = input.value.trim();
	const encodedContent = encodeURI(content);
	output.textContent = `$$${input.value.trim()}$$`;
	window.location.hash = "#" + encodedContent;
	share.innerHTML = `https://sebastianmestre.github.io/LaTeXView/#${encodedContent}`;
	MathJax.texReset();
	MathJax.typesetClear();
	MathJax.typesetPromise([output]);
};
input.addEventListener("input", update);
window.addEventListener("load", function(){
	const content = window.location.hash.substr(1);
	if (content.length > 0)
		input.value = decodeURIComponent(content);
	update();
});
