import {
	AnimatedSprite,
	type Application,
	Point,
	type Sprite,
	Texture,
} from "pixi.js";
import type { InputState } from "./input-state";
import { Cannon } from "./weapons/cannon";
import type { Weapon } from "./weapons/weapon";
import { WORLD_HEIGHT, WORLD_WIDTH, wrapWorld } from "./world";

export class PlayerShip {
	private shipTexture = Texture.from("ship");
	private shipThrustTextures = [
		Texture.from("shipThrust1"),
		Texture.from("shipThrust2"),
	];
	private sprite!: AnimatedSprite;
	private topSpeed = 8;
	private deceleration = 0.05;
	private velocity = new Point();
	private cannon: Cannon;

	public worldX: number;
	public worldY: number;

	constructor(
		startWorldPosition: Point,
		private inputState: InputState,
		private app: Application,
	) {
		this.worldX = startWorldPosition.x;
		this.worldY = startWorldPosition.y;

		this.sprite = new AnimatedSprite([this.shipTexture]);
		this.sprite.animationSpeed = 0.4;
		this.sprite.anchor = 0.5;

		this.cannon = new Cannon(this.app);
	}

	getSprite(): Sprite {
		return this.sprite;
	}

	getWeapon(): Weapon {
		return this.cannon;
	}

	getVelocity(): Point {
		return this.velocity;
	}

	update(deltaTime: number) {
		const centerX = this.app.screen.width / 2;
		const centerY = this.app.screen.height / 2;

		// Aim towards mouse
		this.sprite.rotation =
			Math.atan2(
				this.inputState.mousePosition.y - centerY,
				this.inputState.mousePosition.x - centerX,
			) +
			Math.PI / 2;

		const forwardX = Math.cos(this.sprite.rotation - Math.PI / 2);
		const forwardY = Math.sin(this.sprite.rotation - Math.PI / 2);

		let thrustApplied = false;
		let accX = 0;
		let accY = 0;
		const forwardAcc = 0.15;
		const sideAcc = 0.06;

		if (this.inputState.keysHeld.has("KeyW")) {
			accX += forwardX * forwardAcc;
			accY += forwardY * forwardAcc;
			thrustApplied = true;
		}
		if (this.inputState.keysHeld.has("KeyS")) {
			accX -= forwardX * sideAcc;
			accY -= forwardY * sideAcc;
			thrustApplied = true;
		}
		if (this.inputState.keysHeld.has("KeyA")) {
			const leftX = Math.cos(this.sprite.rotation - Math.PI);
			const leftY = Math.sin(this.sprite.rotation - Math.PI);
			accX += leftX * sideAcc;
			accY += leftY * sideAcc;
			thrustApplied = true;
		}
		if (this.inputState.keysHeld.has("KeyD")) {
			const rightX = Math.cos(this.sprite.rotation);
			const rightY = Math.sin(this.sprite.rotation);
			accX += rightX * sideAcc;
			accY += rightY * sideAcc;
			thrustApplied = true;
		}

		if (thrustApplied) {
			this.velocity.x += accX;
			this.velocity.y += accY;
			if (!this.sprite.playing) {
				this.sprite.textures = this.shipThrustTextures;
				this.sprite.play();
			}
		} else {
			this.decelerate();
		}

		if (this.inputState.isMouseDown && this.cannon.canShoot()) {
			const muzzleOffsetX = forwardX * (this.sprite.width / 2);
			const muzzleOffsetY = forwardY * (this.sprite.height / 2);
			const cannonMuzzlePoint = new Point(
				this.worldX + muzzleOffsetX,
				this.worldY + muzzleOffsetY,
			);
			this.cannon.shoot(
				cannonMuzzlePoint,
				this.sprite.rotation - Math.PI / 2,
				Math.hypot(this.velocity.x, this.velocity.y),
			);
		}

		this.clampSpeed();

		this.worldX += this.velocity.x * deltaTime;
		this.worldY += this.velocity.y * deltaTime;

		this.worldX = wrapWorld(this.worldX, WORLD_WIDTH);
		this.worldY = wrapWorld(this.worldY, WORLD_HEIGHT);

		this.cannon.update(deltaTime);
	}

	private decelerate(): void {
		const currentSpeed = Math.sqrt(
			this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
		);
		if (currentSpeed > 0) {
			const decelerationFactor = Math.min(this.deceleration, currentSpeed);
			this.velocity.x -= decelerationFactor * (this.velocity.x / currentSpeed);
			this.velocity.y -= decelerationFactor * (this.velocity.y / currentSpeed);
		}
		this.sprite.stop();
		this.sprite.textures = [this.shipTexture];
	}

	private clampSpeed() {
		const newSpeed = Math.sqrt(
			this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
		);

		if (newSpeed > this.topSpeed) {
			const scale = this.topSpeed / newSpeed;
			this.velocity.x *= scale;
			this.velocity.y *= scale;
		} else if (newSpeed < 0.01) {
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
	}
}
