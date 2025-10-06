import { DefaultLoader, Engine, Scene, SceneActivationContext } from "excalibur";
import { Player } from "./player";
import { displayIsotopeTable } from "./displayIsotopeTable";

export class MyLevel extends Scene {
    private _engine?: Engine;
        override onInitialize(engine: Engine): void {
                this._engine = engine;
                // Afficher la grille des isotopes dans le body (remplace le fond)
                fetch('public/isotopes.json')
                    .then(r => r.json())
                    .then(data => {
                        let container = document.getElementById('isotope-table');
                        if (!container) {
                            container = document.createElement('div');
                            container.id = 'isotope-table';
                            container.style.position = 'absolute';
                            container.style.top = '0';
                            container.style.left = '0';
                            container.style.zIndex = '0';
                            container.style.width = '100vw';
                            container.style.height = '100vh';
                            container.style.overflow = 'auto';
                            document.body.appendChild(container);
                        }
                        displayIsotopeTable(data, container);
                    });
                // Optionnel : masquer le canvas Excalibur
                const canvas = document.querySelector('canvas');
                if (canvas) canvas.style.display = 'none';
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

    // override onPreDraw supprimé : la grille HTML remplace le fond

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}