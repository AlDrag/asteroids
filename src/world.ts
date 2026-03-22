export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 4000;

export function wrapWorld(val: number, max: number): number {
	let v = val % max;
	if (v < 0) v += max;
	return v;
}

export function getShortestDelta(
	target: number,
	source: number,
	max: number,
): number {
	let delta = (target - source) % max;
	if (delta > max / 2) delta -= max;
	if (delta < -max / 2) delta += max;
	return delta;
}
