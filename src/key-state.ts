export class KeyState {
	keysHeld = new Set<string>();

	constructor() {
		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (!this.keysHeld.has(event.code)) {
				this.keysHeld.add(event.code);
			}
		});
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			this.keysHeld.delete(event.code);
		});
	}
}
