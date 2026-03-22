import { Application, Point } from "pixi.js";
import { loadAssets } from "./assets/loader";
import { Asteroid } from "./asteroid";
import { collided } from "./collision-detector";
import { InputState } from "./input-state";
import { PlayerShip } from "./ship";
import { Starfield } from "./starfield";
import { WORLD_HEIGHT, WORLD_WIDTH, getShortestDelta } from "./world";

export class Game {
	private pixiApplication = new Application();

	async initialise() {
		await loadAssets();
		await this.pixiApplication.init({ resizeTo: window });
		document.body.appendChild(this.pixiApplication.canvas);

		const inputState = new InputState();
		const shipStartWorldPos = new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

		const playerShip = new PlayerShip(
			shipStartWorldPos,
			inputState,
			this.pixiApplication,
		);

		const starfield = new Starfield(400);
		this.pixiApplication.stage.addChild(starfield.getContainer());

		const asteroids: Asteroid[] = new Array(30);
		for (let i = 0; i < asteroids.length; i++) {
			const asteroidVelocity = new Point(
				(Math.random() - 0.5) * 4,
				(Math.random() - 0.5) * 4,
			);
			const asteroid = new Asteroid(asteroidVelocity, this.pixiApplication);
			asteroids[i] = asteroid;
			this.pixiApplication.stage.addChild(asteroid.getSprite());
		}

		this.pixiApplication.stage.addChild(playerShip.getSprite());

		// Render Loop.
		// biome-ignore lint/suspicious/noExplicitAny: Ticker type changed in Pixi.js v8
		this.pixiApplication.ticker.add((ticker: any) => {
			playerShip.update(ticker.deltaTime);

			for (const asteroid of asteroids) {
				asteroid.update(ticker.deltaTime);
			}

			// Camera & Coordinate Transformation
			const screenCenterX = this.pixiApplication.screen.width / 2;
			const screenCenterY = this.pixiApplication.screen.height / 2;

			starfield.update(playerShip, screenCenterX, screenCenterY);

			// Always center the ship
			playerShip.getSprite().x = screenCenterX;
			playerShip.getSprite().y = screenCenterY;

			// Position asteroids relative to ship
			for (const asteroid of asteroids) {
				const dx = getShortestDelta(
					asteroid.worldX,
					playerShip.worldX,
					WORLD_WIDTH,
				);
				const dy = getShortestDelta(
					asteroid.worldY,
					playerShip.worldY,
					WORLD_HEIGHT,
				);
				asteroid.getSprite().x = screenCenterX + dx;
				asteroid.getSprite().y = screenCenterY + dy;
			}

			// Position projectiles relative to ship
			const projectiles = playerShip.getWeapon().getProjectiles();
			for (const projectile of projectiles) {
				const dx = getShortestDelta(
					projectile.worldX,
					playerShip.worldX,
					WORLD_WIDTH,
				);
				const dy = getShortestDelta(
					projectile.worldY,
					playerShip.worldY,
					WORLD_HEIGHT,
				);
				const graphic = projectile.getGraphic();
				graphic.x = screenCenterX + dx;
				graphic.y = screenCenterY + dy;
			}

			// Collision detection
			for (const projectile of projectiles) {
				for (let i = 0; i < asteroids.length; i++) {
					const asteroid = asteroids[i];
					if (
						collided(projectile.getBounds(), asteroid.getSprite().getBounds())
					) {
						playerShip.getWeapon().destroyProjectile(projectile);
						this.pixiApplication.stage.removeChild(asteroid.getSprite());
						asteroids.splice(i, 1);
						// Once a projectile is destroyed, stop checking it
						break;
					}
				}
			}
		});
	}
}
