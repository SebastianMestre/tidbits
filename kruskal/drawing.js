
export function point ( x, y, w, context ) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    context.beginPath();
    context.ellipse(cx+x,cy+y,w,w,0,0,Math.PI*2);
    context.fill();
}

export function line ( sx, sy, dx, dy, context ) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    context.beginPath();
    context.moveTo(cx+sx, cy+sy);
    context.lineTo(cx+dx, cy+dy);
    context.stroke();
}

export function batched_line ( sx, sy, dx, dy, context ) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    context.moveTo(cx+sx, cy+sy);
    context.lineTo(cx+dx, cy+dy);
}
