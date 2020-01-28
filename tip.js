
const body = document.body;

const tipHtml = `
<div class="tip">
	<p>Click on the board to enable and disable cells!</p>
	<button class="tip-button">Got it!</button>
</div>
`;

const template = document.createElement("template");
template.innerHTML = tipHtml;

const tipElement = template.content.children[0];
let button = tipElement.getElementsByClassName("tip-button")[0];

button.addEventListener("click", function(){
	tipElement.style.opacity = 0;

	setTimeout(function(){
		tipElement.parentNode.removeChild(tipElement);
	}, 1000);
});

body.appendChild(tipElement);

