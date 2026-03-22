import { Point } from "pixi.js";

export class InputState {
	keysHeld = new Set<string>();
	mousePosition = new Point(0, 0);
	isMouseDown = false;

	constructor() {
		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (!this.keysHeld.has(event.code)) {
				this.keysHeld.add(event.code);
			}
		});
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			this.keysHeld.delete(event.code);
		});
		document.addEventListener("mousemove", (event: MouseEvent) => {
			this.mousePosition.x = event.clientX;
			this.mousePosition.y = event.clientY;
		});
		document.addEventListener("mousedown", (event: MouseEvent) => {
			// 0 = left click
			if (event.button === 0) {
				this.isMouseDown = true;
			}
		});
		document.addEventListener("mouseup", (event: MouseEvent) => {
			if (event.button === 0) {
				this.isMouseDown = false;
			}
		});
	}
}
