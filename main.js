const share = document.getElementById('ShareLink');
const input = document.getElementById('MathInput');
const output = document.getElementById('MathPreview');

let need_update = true;

const update = function(){
	if (!need_update)
		return;
	need_update = false;

	const content = input.value.trim();
	const encodedContent = encodeURI(content);

	output.textContent = `$$${content}$$`;
	share.textContent = `https://sebastianmestre.github.io/LaTeXView/#${encodedContent}`;
	window.history.replaceState({content : encodedContent}, "", `#${encodedContent}`);

	MathJax.texReset();
	MathJax.typesetClear();
	MathJax.typesetPromise([output]);
};

input.addEventListener("input", function(){
	need_update = true;
});

window.addEventListener("load", function(){
	const content = window.location.hash.substr(1);
	if (content.length > 0)
		input.value = decodeURIComponent(content);
	need_update = true;

	window.setInterval(update, 500);
});

window.addEventListener("hashchange", function(){
	const content = window.location.hash.substr(1);
	input.value = decodeURIComponent(content);
	need_update = true;
});
