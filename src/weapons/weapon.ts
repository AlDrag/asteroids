import type { Bounds } from "pixi.js";

export interface Weapon {
	getProjectiles(): Projectile[];
	destroyProjectile(projectile: Projectile): void;
}

export interface Projectile {
	getBounds(): Bounds;
}
