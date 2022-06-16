// taken from https://stackoverflow.com/a/13194087/10184103

var ctxClass = window.audioContext ||window.AudioContext || window.AudioContext || window.webkitAudioContext
var ctx = new ctxClass();

var osc = ctx.createOscillator();
osc.type = 0;
osc.connect(ctx.destination);


setFreq(frecelem.value);
frecelem.addEventListener("change", e=>{
    setFreq(frecelem.value);
});

stopbtn.addEventListener("click", e=>{
    stopSound();
});

startbtn.addEventListener("click", e=>{
    startSound();
});


function setFreq(f){
    osc.frequency.setValueAtTime(
        Number(f), ctx.currentTime);
}

function startSound(){
    if (osc.noteOn) osc.noteOn(0); // old browsers
    if (osc.start) osc.start(); // new browsers
}

function stopSound(){
    if (osc.noteOff) osc.noteOff(0); // old browsers
    if (osc.stop) osc.stop(); // new browsers
}
