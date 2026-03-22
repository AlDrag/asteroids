import type { Bounds, Container } from "pixi.js";

export interface Weapon {
	getProjectiles(): Projectile[];
	destroyProjectile(projectile: Projectile): void;
}

export interface Projectile {
	getBounds(): Bounds;
	getGraphic(): Container;
	worldX: number;
	worldY: number;
}
