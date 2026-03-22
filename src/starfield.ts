import { Container, Point, Sprite, Texture } from "pixi.js";
import type { PlayerShip } from "./ship";
import { WORLD_HEIGHT, WORLD_WIDTH, getShortestDelta } from "./world";

export class Starfield {
	private container = new Container();
	private stars: {
		sprite: Sprite;
		worldX: number;
		worldY: number;
		size: number;
	}[] = [];

	constructor(numStars: number) {
		for (let i = 0; i < numStars; i++) {
			const sprite = new Sprite(Texture.WHITE);
			const size = Math.random() * 2 + 1;
			sprite.width = size;
			sprite.height = size;
			sprite.alpha = Math.random() * 0.5 + 0.3;
			sprite.anchor.set(0.5);

			this.container.addChild(sprite);

			this.stars.push({
				sprite,
				worldX: Math.random() * WORLD_WIDTH,
				worldY: Math.random() * WORLD_HEIGHT,
				size,
			});
		}
	}

	getContainer(): Container {
		return this.container;
	}

	update(ship: PlayerShip, screenWidth: number, screenHeight: number) {
		const centerX = screenWidth / 2;
		const centerY = screenHeight / 2;

		const shipVelocity = ship.getVelocity();
		const speed = Math.hypot(shipVelocity.x, shipVelocity.y);
		const stretchMultiplier = 1.5;

		for (const star of this.stars) {
			const dx = getShortestDelta(star.worldX, ship.worldX, WORLD_WIDTH);
			const dy = getShortestDelta(star.worldY, ship.worldY, WORLD_HEIGHT);

			// Render at delta from center
			star.sprite.x = centerX + dx;
			star.sprite.y = centerY + dy;

			// Stretch stars based on movement vector to create speed/warp illusion
			// Asteroids actually move independently, but stars are stationary in the world
			// so they perfectly reflect the ship's inverted velocity through motion blur
			if (speed > 1) {
				star.sprite.rotation = Math.atan2(-shipVelocity.y, -shipVelocity.x);
				star.sprite.width = star.size + speed * stretchMultiplier;
				star.sprite.height = Math.max(0.5, star.size * 0.5);
			} else {
				star.sprite.rotation = 0;
				star.sprite.width = star.size;
				star.sprite.height = star.size;
			}
		}
	}
}
