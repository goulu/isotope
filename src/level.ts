import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import { Player } from "./player";
import { Resources } from "./resources";

export class MyLevel extends Scene {
    private _engine?: Engine;
    override onInitialize(engine: Engine): void {
        this._engine = engine;
        // Scene.onInitialize is where we recommend you perform the composition for your game
        const player = new Player();
        this.add(player); // Actors need to be added to a scene to be drawn
    }

    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Called before anything updates in the scene
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Dessiner l'image de fond en gardant le ratio (effet cover)
        if (Resources.Background.isLoaded() && this._engine) {
            const img = Resources.Background.image;
            const canvasW = this._engine.drawWidth;
            const canvasH = this._engine.drawHeight;
            const imgW = img.width;
            const imgH = img.height;
            const scale = Math.max(canvasW / imgW, canvasH / imgH);
            const drawW = imgW * scale;
            const drawH = imgH * scale;
            const offsetX = (canvasW - drawW) / 2;
            const offsetY = (canvasH - drawH) / 2;
            ctx.drawImage(
                img,
                0,
                0,
                imgW,
                imgH,
                offsetX,
                offsetY,
                drawW,
                drawH
            );
        }
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}