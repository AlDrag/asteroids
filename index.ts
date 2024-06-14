import { Application, Assets, Sprite } from "pixi.js";

async function application() {
	const app = new Application();
	await app.init({ resizeTo: window });
	document.body.appendChild(app.canvas);

	await Assets.load({ src: "./assets/sprites/ship.png", alias: "ship" });
	const sprite = Sprite.from("ship");
	sprite.anchor = 0.5;
	sprite.x = 100;
	sprite.y = 100;
	app.stage.addChild(sprite);

	const keyState = new KeyState();

	let rotateDelta = 0;
	const rotationDamping = 0.0002;
	const acceleration = 0.05;
	let speed = 0;
	const topSpeed = 4;
	app.ticker.add((ticker) => {
		let deltaX = 0;
		let deltaY = 0;

		if (keyState.keysHeld.has("ArrowUp")) {
			if (speed < topSpeed) {
				speed += acceleration;
			}
		} else if (keyState.keysHeld.has("ArrowDown")) {
			if (speed > 0) {
				speed -= acceleration;
			}
		}

		if (keyState.keysHeld.has("ArrowLeft")) {
			rotateDelta += -0.0001;
		} else if (keyState.keysHeld.has("ArrowRight")) {
			rotateDelta -= -0.0001;
		} else if (rotateDelta < 0) {
			rotateDelta += rotationDamping;
		} else if (rotateDelta > 0) {
			rotateDelta -= rotationDamping;
		}

		deltaX += speed * Math.sin(sprite.rotation);
		deltaY -= speed * Math.cos(sprite.rotation);

		sprite.x += deltaX * ticker.deltaTime;
		sprite.y += deltaY * ticker.deltaTime;
		console.log(deltaX, deltaY);
		sprite.rotation += rotateDelta;
	});
}

document.addEventListener("DOMContentLoaded", () => {
	application();
});

class KeyState {
	keysHeld = new Set<string>();

	constructor() {
		document.addEventListener("keydown", (event: KeyboardEvent) => {
			console.log(event.code);
			if (!this.keysHeld.has(event.code)) {
				this.keysHeld.add(event.code);
			}
		});
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			this.keysHeld.delete(event.code);
		});
	}
}
