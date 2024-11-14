import {
	type Application,
	Graphics,
	type PointLike,
	type Bounds,
} from "pixi.js";

export class Cannon {
	private readonly rateOfFireMs = 500;
	private readonly velocity = 10;
	private lastShot?: Date;

	private projectiles: Projectile[] = [];

	constructor(private app: Application) {}

	canShoot(): boolean {
		return !this.lastShot || +new Date() - +this.lastShot > this.rateOfFireMs;
	}

	shoot(startingPosition: PointLike, vector: number, sourceVelocity: number) {
		const projectile = new Projectile(
			startingPosition,
			vector,
			this.velocity + sourceVelocity,
		);
		this.projectiles.push(projectile);
		this.app.stage.addChild(projectile.getGraphic());
		this.lastShot = new Date();
	}

	getProjectiles(): Projectile[] {
		return this.projectiles;
	}

	destroyProjectile(projectile: Projectile) {
		this.app.stage.removeChild(projectile.getGraphic());
		this.projectiles.splice(
			this.projectiles.findIndex((p) => p === projectile),
			1,
		);
	}

	update(deltaTime: number) {
		for (let i = 0; i < this.projectiles.length; i++) {
			const projectile = this.projectiles[i];
			if (projectile.hasExceededMaxDistance()) {
				this.app.stage.removeChild(projectile.getGraphic());
				this.projectiles.splice(i, 1);
			} else {
				projectile.update(deltaTime);
			}
		}
	}
}

class Projectile {
	private projectileVector: Graphics;
	private readonly maxDistance = 1000;

	constructor(
		{ x, y }: PointLike,
		private vector: number,
		private velocity: number,
	) {
		const beginning = Math.cos(this.vector) * 10;
		const end = Math.sin(this.vector) * 10;
		this.projectileVector = new Graphics()
			.moveTo(x, y)
			.lineTo(x + beginning, y + end)
			.stroke({ color: 0xff3300, width: 4 });
	}

	getGraphic(): Graphics {
		return this.projectileVector;
	}

	getBounds(): Bounds {
		return this.projectileVector.getBounds();
	}

	hasExceededMaxDistance(): boolean {
		const travelledDistance = Math.sqrt(
			(this.projectileVector.x - 0) ** 2 + (this.projectileVector.y - 0) ** 2,
		);

		return travelledDistance > this.maxDistance;
	}

	update(deltaTime: number) {
		const x = Math.cos(this.vector) * this.velocity;
		const y = Math.sin(this.vector) * this.velocity;

		this.projectileVector.x += x * deltaTime;
		this.projectileVector.y += y * deltaTime;
	}
}
