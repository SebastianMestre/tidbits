export function distsq (a,b) {
    return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);
}

export function dist (a,b) {
    return distsq(a,b)**0.5;
}
