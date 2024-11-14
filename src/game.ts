import { Application, Point } from "pixi.js";
import { PlayerShip } from "./ship";
import { KeyState } from "./key-state";
import { Asteroid } from "./asteroid";
import { collided } from "./collision-detector";
import { loadAssets } from "./assets/loader";

export class Game {
	private pixiApplication = new Application();

	async initialise() {
		await loadAssets();
		await this.pixiApplication.init({ resizeTo: window });
		document.body.appendChild(this.pixiApplication.canvas);

		const shipStartPosition = new Point(
			document.body.clientWidth / 2,
			document.body.clientHeight / 2,
		);
		const playerShip = new PlayerShip(
			shipStartPosition,
			new KeyState().keysHeld,
			this.pixiApplication,
		);
		const asteroids: Asteroid[] = new Array(5);
		for (let i = 0; i < asteroids.length; i++) {
			const asteroidStartPosition = new Point(
				Math.round(Math.random()) * 4 - 1,
				Math.round(Math.random()) * 4 - 1,
			);
			const asteroid = new Asteroid(
				asteroidStartPosition,
				this.pixiApplication,
			);
			asteroids[i] = asteroid;
			this.pixiApplication.stage.addChild(asteroid.getSprite());
		}
		this.pixiApplication.stage.addChild(playerShip.getSprite());

		// Render Loop.
		this.pixiApplication.ticker.add((ticker) => {
			playerShip.update(ticker.deltaTime);
			for (const asteroid of asteroids) {
				asteroid.update(ticker.deltaTime);
			}
			const projectiles = playerShip.getWeapon().getProjectiles();
			for (const projectile of projectiles) {
				for (let i = 0; i < asteroids.length; i++) {
					const asteroid = asteroids[i];
					if (
						collided(projectile.getBounds(), asteroid.getSprite().getBounds())
					) {
						playerShip.getWeapon().destroyProjectile(projectile);
						this.pixiApplication.stage.removeChild(asteroid.getSprite());
						asteroids.splice(i, 1);
					}
				}
			}
		});
	}
}
