import { type Application, Graphics } from "pixi.js";

export class Cannon {
	private rateOfFireMs = 500;
	private lastShot?: Date;

	private projectiles: Projectile[] = [];

	constructor(private app: Application) {}

	canShoot(): boolean {
		return !this.lastShot || +new Date() - +this.lastShot > this.rateOfFireMs;
	}

	shoot(x: number, y: number, vector: number) {
		const projectile = new Projectile(x, y, vector);
		this.projectiles.push(projectile);
		this.app.stage.addChild(projectile.getGraphic());
		this.lastShot = new Date();
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
	private velocity = 10;
	private vector = 0;
	private readonly maxDistance = 400;

	constructor(x: number, y: number, vector: number) {
		this.vector = vector;
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
