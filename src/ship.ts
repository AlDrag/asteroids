import {
	type Application,
	type Sprite,
	Point,
	Texture,
	AnimatedSprite,
} from "pixi.js";
import { Cannon } from "./weapons/cannon";
import type { Weapon } from "./weapons/weapon";

export class PlayerShip {
	private shipTexture = Texture.from("ship");
	private shipThrustTextures = [
		Texture.from("shipThrust1"),
		Texture.from("shipThrust2"),
	];
	private sprite!: AnimatedSprite;
	private thrustVector = 0;
	private accelerationFactor = 0;
	private topSpeed = 8;
	private maxAcceleration = 0.07;
	private rotationSpeed = 0.1;
	private deceleration = 0.02;
	private velocity = new Point();
	private cannon: Cannon;

	constructor(
		private startPosition: Point,
		private keysHeld: Set<string>,
		private app: Application,
	) {
		this.sprite = new AnimatedSprite([this.shipTexture]);
		this.sprite.animationSpeed = 0.4;
		this.sprite.anchor = 0.5;
		this.sprite.position = this.startPosition.clone();

		this.cannon = new Cannon(this.app);
	}

	getSprite(): Sprite {
		return this.sprite;
	}

	getWeapon(): Weapon {
		return this.cannon;
	}

	update(deltaTime: number) {
		if (this.keysHeld.has("ArrowUp")) {
			this.thrust();
		} else {
			this.decelerate();
		}

		if (this.keysHeld.has("Space") && this.cannon.canShoot()) {
			const cannonMuzzlePoint = new Point(
				this.sprite.x +
					(Math.cos(this.sprite.rotation - 90 * (Math.PI / 180)) *
						this.sprite.width) /
						2,
				this.sprite.y +
					(Math.sin(this.sprite.rotation - 90 * (Math.PI / 180)) *
						this.sprite.height) /
						2,
			);
			this.cannon.shoot(
				cannonMuzzlePoint,
				this.sprite.rotation - 90 * (Math.PI / 180),
				// Ship's speed.
				Math.hypot(this.velocity.x, this.velocity.y),
			);
		}

		this.clampSpeed();

		this.sprite.x += this.velocity.x * deltaTime;
		this.sprite.y += this.velocity.y * deltaTime;

		if (this.keysHeld.has("ArrowLeft")) {
			this.rotate("left", deltaTime);
		} else if (this.keysHeld.has("ArrowRight")) {
			this.rotate("right", deltaTime);
		}

		this.cannon.update(deltaTime);

		this.wrapAround();
	}

	private thrust(): void {
		this.accelerationFactor = Math.min(this.accelerationFactor + 0.01, 1);
		const acceleration =
			this.maxAcceleration * this.easeOutQuad(this.accelerationFactor);
		this.velocity.x += acceleration * Math.sin(this.thrustVector);
		this.velocity.y += -acceleration * Math.cos(this.thrustVector);
		if (!this.sprite.playing) {
			this.sprite.textures = this.shipThrustTextures;
			this.sprite.play();
		}
	}

	private decelerate(): void {
		this.accelerationFactor = 0;
		const currentSpeed = Math.sqrt(
			this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
		);
		if (currentSpeed > 0) {
			const decelerationFactor = Math.min(this.deceleration, currentSpeed);
			this.velocity.x += -decelerationFactor * (this.velocity.x / currentSpeed);
			this.velocity.y += -decelerationFactor * (this.velocity.y / currentSpeed);
		}
		this.sprite.stop();
		this.sprite.textures = [this.shipTexture];
	}

	private clampSpeed() {
		// Compute the new speed
		const newSpeed = Math.sqrt(
			this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
		);

		// Adjust velocity to not exceed the top speed
		if (newSpeed > this.topSpeed) {
			const scale = this.topSpeed / newSpeed;
			this.velocity.x *= scale;
			this.velocity.y *= scale;
		} else if (newSpeed < 0.01) {
			// Stop the ship completely if the speed is very low
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
	}

	/**
	 * Rotate ship sprite in either left/right direction by given radians
	 * from its current rotation position.
	 *
	 * @param direction left or right direction.
	 * @param tick delta time from render loop.
	 */
	private rotate(direction: "left" | "right", tick: number): void {
		switch (direction) {
			case "left":
				this.sprite.rotation -= this.rotationSpeed * tick;
				break;
			case "right":
				this.sprite.rotation += this.rotationSpeed * tick;
				break;
		}

		this.thrustVector = this.sprite.rotation;
	}

	/**
	 * When the Ship goes over the edge of the screen, it should appear
	 * on the opposite side.
	 */
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

	private easeOutQuad(t: number): number {
		return 1 - (1 - t) ** 3;
	}
}
