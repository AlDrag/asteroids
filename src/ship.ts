import { type Application, Assets, Sprite } from "pixi.js";

export class PlayerShip {
	private sprite!: Sprite;
	private thrustVector = 0;
	private accelerationFactor = 0;
	private topSpeed = 8;
	private maxAcceleration = 0.07;
	private rotationSpeed = 0.1;
	private deceleration = 0.02;
	private velocity = {
		x: 0,
		y: 0,
	};

	constructor(
		private startPosition: { x: number; y: number },
		private keysHeld: Set<string>,
		private app: Application,
	) {}

	getSprite(): Sprite {
		return this.sprite;
	}

	async loadAssets() {
		await Assets.load({ src: "./assets/sprites/ship.png", alias: "ship" });
		this.sprite = Sprite.from("ship");
		this.sprite.anchor = 0.5;
		this.sprite.x = this.startPosition.x;
		this.sprite.y = this.startPosition.y;
	}

	update(deltaTime: number) {
		if (this.keysHeld.has("ArrowUp")) {
			this.thrust();
		} else {
			this.decelerate();
		}

		this.clampSpeed();

		this.sprite.x += this.velocity.x * deltaTime;
		this.sprite.y += this.velocity.y * deltaTime;

		if (this.keysHeld.has("ArrowLeft")) {
			this.rotate("left", deltaTime);
		} else if (this.keysHeld.has("ArrowRight")) {
			this.rotate("right", deltaTime);
		}

		this.wrapAround();
	}

	private thrust(): void {
		this.accelerationFactor = Math.min(this.accelerationFactor + 0.01, 1);
		const acceleration =
			this.maxAcceleration * this.easeOutQuad(this.accelerationFactor);
		this.velocity.x += acceleration * Math.sin(this.thrustVector);
		this.velocity.y += -acceleration * Math.cos(this.thrustVector);
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
