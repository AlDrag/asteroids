import { Point } from "pixi.js";

export class InputState {
	keysHeld = new Set<string>();
	crosshairOffset = new Point(0, 0);
	isMouseDown = false;

	constructor(canvas: HTMLCanvasElement) {
		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (!this.keysHeld.has(event.code)) {
				this.keysHeld.add(event.code);
			}
		});
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			this.keysHeld.delete(event.code);
		});

		canvas.addEventListener("mousedown", (event: MouseEvent) => {
			if (document.pointerLockElement !== canvas) {
				canvas.requestPointerLock();
			}
			if (event.button === 0) {
				this.isMouseDown = true;
			}
		});

		document.addEventListener("mouseup", (event: MouseEvent) => {
			if (event.button === 0) {
				this.isMouseDown = false;
			}
		});

		document.addEventListener("mousemove", (event: MouseEvent) => {
			if (document.pointerLockElement === canvas) {
				this.crosshairOffset.x += event.movementX;
				this.crosshairOffset.y += event.movementY;

				const maxOffsetX = window.innerWidth / 2;
				const maxOffsetY = window.innerHeight / 2;
				const maxDist = Math.min(maxOffsetX, maxOffsetY) * 0.95;

				const dist = Math.hypot(this.crosshairOffset.x, this.crosshairOffset.y);
				if (dist > maxDist) {
					this.crosshairOffset.x = (this.crosshairOffset.x / dist) * maxDist;
					this.crosshairOffset.y = (this.crosshairOffset.y / dist) * maxDist;
				}
			} else {
				this.crosshairOffset.x = event.clientX - window.innerWidth / 2;
				this.crosshairOffset.y = event.clientY - window.innerHeight / 2;
			}
		});
	}
}
