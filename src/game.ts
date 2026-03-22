import { Application, Graphics, Point } from "pixi.js";
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
		document.body.style.cursor = "none"; // Hide OS cursor

		const inputState = new InputState(this.pixiApplication.canvas);
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

		const crosshair = new Graphics()
			.circle(0, 0, 5)
			.moveTo(-15, 0)
			.lineTo(15, 0)
			.moveTo(0, -15)
			.lineTo(0, 15)
			.stroke({ color: 0x00ff00, width: 2 });
		this.pixiApplication.stage.addChild(crosshair);

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

			// Slightly pan the camera towards the crosshair
			const cameraPanOffsetX = inputState.crosshairOffset.x * 0.4;
			const cameraPanOffsetY = inputState.crosshairOffset.y * 0.4;

			const renderCenterX = screenCenterX - cameraPanOffsetX;
			const renderCenterY = screenCenterY - cameraPanOffsetY;

			starfield.update(playerShip, renderCenterX, renderCenterY);

			// Always center the ship relative to camera pan
			playerShip.getSprite().x = renderCenterX;
			playerShip.getSprite().y = renderCenterY;

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
				asteroid.getSprite().x = renderCenterX + dx;
				asteroid.getSprite().y = renderCenterY + dy;
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
				graphic.x = renderCenterX + dx;
				graphic.y = renderCenterY + dy;
			}

			// Position crosshair UI (not affected by camera pan, locked to physical screen/mouse)
			crosshair.x = screenCenterX + inputState.crosshairOffset.x;
			crosshair.y = screenCenterY + inputState.crosshairOffset.y;

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
