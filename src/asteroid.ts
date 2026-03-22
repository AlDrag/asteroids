import { type Application, type PointLike, Sprite } from "pixi.js";
import { WORLD_HEIGHT, WORLD_WIDTH, wrapWorld } from "./world";

export class Asteroid {
	private sprite!: Sprite;
	public worldX: number;
	public worldY: number;

	constructor(
		private velocity: PointLike,
		private app: Application,
	) {
		this.sprite = Sprite.from("asteroid");
		this.sprite.anchor = 0.5;
		this.worldX = Math.random() * WORLD_WIDTH;
		this.worldY = Math.random() * WORLD_HEIGHT;
	}

	getSprite(): Sprite {
		return this.sprite;
	}

	update(deltaTime: number) {
		this.worldX += this.velocity.x * deltaTime;
		this.worldY += this.velocity.y * deltaTime;

		this.worldX = wrapWorld(this.worldX, WORLD_WIDTH);
		this.worldY = wrapWorld(this.worldY, WORLD_HEIGHT);
	}
}
