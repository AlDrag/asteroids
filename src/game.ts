import { Application } from "pixi.js";
import { PlayerShip } from "./ship";
import { KeyState } from "./key-state";

export class Game {
	private pixiApplication = new Application();

	async initialise() {
		await this.pixiApplication.init({ resizeTo: window });
		document.body.appendChild(this.pixiApplication.canvas);

		const startPosition = {
			x: document.body.clientWidth / 2,
			y: document.body.clientHeight / 2,
		};
		const playerShip = new PlayerShip(startPosition, new KeyState().keysHeld);
		await playerShip.loadAssets();
		this.pixiApplication.stage.addChild(playerShip.getSprite());

		// Render Loop.
		this.pixiApplication.ticker.add((ticker) => {
			playerShip.update(ticker.deltaTime);
		});
	}
}
