import {
	type Application,
	type Bounds,
	Graphics,
	type PointLike,
} from "pixi.js";
import { WORLD_HEIGHT, WORLD_WIDTH, wrapWorld } from "../world";

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
				i--;
			} else {
				projectile.update(deltaTime);
			}
		}
	}
}

class Projectile {
	private projectileVector: Graphics;
	private readonly maxDistance = 1000;
	private distanceTravelled = 0;

	public worldX: number;
	public worldY: number;

	constructor(
		startPos: PointLike,
		private vector: number,
		private velocity: number,
	) {
		this.worldX = startPos.x;
		this.worldY = startPos.y;

		// The graphic starts drawn around 0,0 and we position it using Game render loop
		const beginning = Math.cos(this.vector) * 10;
		const end = Math.sin(this.vector) * 10;
		this.projectileVector = new Graphics()
			.moveTo(0, 0)
			.lineTo(beginning, end)
			.stroke({ color: 0xff3300, width: 4 });
	}

	getGraphic(): Graphics {
		return this.projectileVector;
	}

	getBounds(): Bounds {
		return this.projectileVector.getBounds();
	}

	hasExceededMaxDistance(): boolean {
		return this.distanceTravelled > this.maxDistance;
	}

	update(deltaTime: number) {
		const dx = Math.cos(this.vector) * this.velocity * deltaTime;
		const dy = Math.sin(this.vector) * this.velocity * deltaTime;

		this.worldX += dx;
		this.worldY += dy;

		this.distanceTravelled += Math.hypot(dx, dy);

		this.worldX = wrapWorld(this.worldX, WORLD_WIDTH);
		this.worldY = wrapWorld(this.worldY, WORLD_HEIGHT);
	}
}
