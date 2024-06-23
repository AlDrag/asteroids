import { Assets, type PointLike, Sprite, type Application } from "pixi.js";

export class Asteroid {
	private sprite!: Sprite;

	constructor(
		private velocity: PointLike,
		private app: Application,
	) {}

	getSprite(): Sprite {
		return this.sprite;
	}

	async loadAssets() {
		await Assets.load({
			src: "./assets/sprites/asteroid.png",
			alias: "asteroid",
		});
		this.sprite = Sprite.from("asteroid");
		this.sprite.anchor = 0.5;
		this.sprite.x = Math.round(Math.random()) * 1000 - 1;
		this.sprite.y = Math.round(Math.random()) * 1000 - 1;
	}

	update(deltaTime: number) {
		this.sprite.x += this.velocity.x * deltaTime;
		this.sprite.y += this.velocity.y * deltaTime;

		this.wrapAround();
	}

	private wrapAround(): void {
		const halfWidth = this.sprite.width / 2;
		const halfHeight = this.sprite.height / 2;
		const screenWidth = this.app.screen.width;
		const screenHeight = this.app.screen.height;

		if (this.sprite.x > screenWidth + halfWidth) {
			this.sprite.x = -halfWidth;
		} else if (this.sprite.x < -halfWidth) {
			this.sprite.x = screenWidth + halfWidth;
		}

		if (this.sprite.y > screenHeight + halfHeight) {
			this.sprite.y = -halfHeight;
		} else if (this.sprite.y < -halfHeight) {
			this.sprite.y = screenHeight + halfHeight;
		}
	}
}
