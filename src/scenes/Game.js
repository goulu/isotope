import Phaser from 'phaser';
import readmeText from '../../README.md?raw';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload() {
        // We can load some placeholder assets from phaser labs 
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
    }

    create() {
        // Background
        const bg = this.add.image(400, 300, 'sky');
        bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Add some basic physics entities
        const particles = this.add.particles(0, 0, 'red', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        const logo = this.physics.add.image(400, 100, 'logo');
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);

        // Display the README.md text
        const infoText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            readmeText,
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#00000088',
                padding: { x: 20, y: 20 },
                wordWrap: { width: this.sys.game.config.width - 40 }
            }
        ).setOrigin(0.5);

        // Handle resize for background and text
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            bg.setPosition(width / 2, height / 2);
            bg.setDisplaySize(width, height);

            infoText.setPosition(width / 2, height / 2);
            infoText.setStyle({ wordWrap: { width: width - 40 } });
        });
    }
}
