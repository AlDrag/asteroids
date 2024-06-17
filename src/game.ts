import { Application } from "pixi.js";
import { PlayerShip } from "./ship";
import { KeyState } from "./key-state";
import { Asteroid } from "./asteroid";

export class Game {
	private pixiApplication = new Application();

	async initialise() {
		await this.pixiApplication.init({ resizeTo: window });
		document.body.appendChild(this.pixiApplication.canvas);

		const startPosition = {
			x: document.body.clientWidth / 2,
			y: document.body.clientHeight / 2,
		};
		const playerShip = new PlayerShip(
			startPosition,
			new KeyState().keysHeld,
			this.pixiApplication,
		);
		const asteroids: Asteroid[] = new Array(5);
		for (let i = 0; i < asteroids.length; i++) {
			const asteroid = new Asteroid(
				{
					x: Math.round(Math.random()) * 4 - 1,
					y: Math.round(Math.random()) * 4 - 1,
				},
				this.pixiApplication,
			);
			asteroids[i] = asteroid;
			await asteroid.loadAssets();
			this.pixiApplication.stage.addChild(asteroid.getSprite());
		}
		await playerShip.loadAssets();
		this.pixiApplication.stage.addChild(playerShip.getSprite());

		// Render Loop.
		this.pixiApplication.ticker.add((ticker) => {
			playerShip.update(ticker.deltaTime);
			for (const asteroid of asteroids) {
				asteroid.update(ticker.deltaTime);
			}
		});
	}
}
