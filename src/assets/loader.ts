import { Assets } from "pixi.js";

export async function loadAssets() {
	await Assets.init({ manifest: "./assets/manifest.json" });
	await Assets.loadBundle("player-ship");
	await Assets.loadBundle("asteroids");
}
