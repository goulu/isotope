import Phaser from 'phaser';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.isotopesDB = null;
        this.currentIsotope = null;
        this.gridContainer = null;
        this.tileSize = 60;

        // Decay Timer properties
        this.decayTimeLeft = 0; // in milliseconds
        this.isStable = true;

        // Level properties
        this.levelsData = null;
        this.currentLevelIndex = 0;
        this.isLevelComplete = false;
    }

    preload() {
        this.load.setBaseURL('./'); // Since isotopes.json is in public/
        this.load.json('isotopes', 'isotopes.json');
        this.load.json('levels', 'levels.json');

        // Local Assets
        this.load.image('sky', 'assets/img/space3.png');

        // Audio
        this.load.audio('sfx_shoot', 'assets/audio/blaster.wav');
        this.load.audio('sfx_decay', 'assets/audio/explosion.wav');
        this.load.audio('sfx_win', 'assets/audio/key.wav');
    }

    create() {
        // Load Database
        this.isotopesDB = this.cache.json.get('isotopes');

        // Background
        this.bg = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'sky');
        this.bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Sound Effects (lowered volume)
        this.sndShoot = this.sound.add('sfx_shoot', { volume: 0.3 });
        this.sndDecay = this.sound.add('sfx_decay', { volume: 0.5 });
        this.sndWin = this.sound.add('sfx_win', { volume: 0.6 });

        // Group for Segrè Grid
        this.gridContainer = this.add.container(0, 0);

        // Core UI representation (Physics body for collisions)
        this.coreGraphics = this.add.rectangle(this.sys.game.config.width / 2, this.sys.game.config.height / 2, this.tileSize, this.tileSize, 0x000000, 0); // invisible hitbox, 0 alpha
        this.physics.add.existing(this.coreGraphics, true); // true = static body

        // Tooltip container
        this.tooltipBg = this.add.rectangle(0, 0, 10, 10, 0x000000, 0.9).setOrigin(0, 0);
        this.tooltipBg.setStrokeStyle(1, 0xffffff);
        this.tooltipText = this.add.text(10, 10, '', {
            fontFamily: 'Courier',
            fontSize: '14px',
            color: '#ffffff',
            align: 'left'
        });
        this.tooltipContainer = this.add.container(0, 0, [this.tooltipBg, this.tooltipText]).setDepth(200).setVisible(false);

        this.input.on('pointermove', (pointer) => {
            if (this.tooltipContainer.visible) {
                this.updateTooltipPosition(pointer);
            }
        });

        // Level UI (Top)
        this.levelsData = this.cache.json.get('levels');

        this.levelText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000cc',
                padding: { x: 10, y: 10 },
                wordWrap: { width: this.sys.game.config.width - 40 }
            }
        ).setOrigin(0.5, 1);
        this.levelText.setDepth(100);

        this.nextLevelButton = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - 40,
            'Niveau Suivant >>',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#2E8B57',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setInteractive().setVisible(false);
        this.nextLevelButton.setDepth(100);

        // Title Banner (I-Sc-O-Te-P-Es)
        this.createTitleBanner();

        this.nextLevelButton.on('pointerdown', () => {
            this.loadLevel(this.currentLevelIndex + 1);
        });

        // Setup dynamic tile size based on screen width
        this.updateTileSize();

        // Initialize Level 0 or fallback to sandbox
        if (this.levelsData && this.levelsData.length > 0) {
            this.loadLevel(0);
        } else {
            this.setElement('Pb-208');
        }


        // Disable default right-click context menu
        this.input.mouse.disableContextMenu();

        // Handle Input
        // Neutron (Left click, Space, or Right arrow) -> n+1
        // Electron (Right click, or Down arrow) -> p-1, n+1

        this.input.on('pointerdown', (pointer) => {
            if (pointer.button === 0) { // Left click
                this.actionNeutron();
            } else if (pointer.button === 2) { // Right click
                this.actionElectron();
            }
        });

        this.input.keyboard.on('keydown-SPACE', () => this.actionNeutron());
        this.input.keyboard.on('keydown-RIGHT', () => this.actionNeutron());
        this.input.keyboard.on('keydown-DOWN', () => this.actionElectron());

        // Handle resize
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;

            this.bg.setPosition(width / 2, height / 2);
            this.bg.setDisplaySize(width, height);

            this.updateTileSize();

            this.coreGraphics.setPosition(width / 2, height / 2);
            this.coreGraphics.body.updateFromGameObject();

            this.levelText.setPosition(width / 2, height);
            this.levelText.setStyle({ wordWrap: { width: width - 20 } });
            this.levelText.setOrigin(0.5, 1);

            this.nextLevelButton.setPosition(width / 2, height - 120);

            // Re-center title banner
            this.createTitleBanner();

            this.updateGrid(); // Redraw grid on center
        });
    }

    updateTileSize() {
        const width = this.sys.game.config.width;
        // A 7x7 grid should fit inside the width with a minimal margin
        // 7 tiles * size < width - 10 => size = (width - 10) / 7
        this.tileSize = Math.floor(Math.min(60, (width - 10) / 7));
    }

    createTitleBanner() {
        if (this.titleBannerContainer) this.titleBannerContainer.destroy();

        const width = this.sys.game.config.width;
        const spacing = 5;
        const bannerTileSize = Math.floor(Math.min(50, (width - 20 - spacing * 5) / 6));

        // Place banner at very top
        this.titleBannerContainer = this.add.container(width / 2, bannerTileSize / 2 + 10);

        // Target isotopes to spell I-Sc-O-Te-P-Es
        const bannerIsotopes = ['I-127', 'Sc-45', 'O-16', 'Te-120', 'P-31', 'Es-252'];

        const totalWidth = (bannerIsotopes.length * bannerTileSize) + ((bannerIsotopes.length - 1) * spacing);
        const startX = -totalWidth / 2 + (bannerTileSize / 2);

        bannerIsotopes.forEach((isoName, index) => {
            const isoData = this.isotopesDB[isoName] || { decayMode: 'None', protons: 0 };
            const sym = isoName.split('-')[0];
            const mass = isoName.split('-')[1];

            const tileX = startX + index * (bannerTileSize + spacing);

            // Draw tile
            const rect = this.add.rectangle(tileX, 0, bannerTileSize, bannerTileSize, this.getDecayColor(isoData.decayMode));
            rect.setStrokeStyle(2, 0xffffff);

            // Text Label
            const labelColor = (isoData.decayMode === "None") ? '#ffffff' : '#000000';
            const label = this.add.text(tileX, 0, `${sym}\n${mass}`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: labelColor,
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.titleBannerContainer.add([rect, label]);
        });

        // Add a nice semi-transparent dark background for the banner so it pops over the grid
        const bgRect = this.add.rectangle(0, 0, totalWidth + 20, bannerTileSize + 20, 0x000000, 0.5);
        this.titleBannerContainer.addAt(bgRect, 0);

        // Put banner behind the level text, but above the main grid
        this.titleBannerContainer.setDepth(50);
    }

    actionNeutron() {
        if (!this.currentIsotope || this.isLevelComplete) return;
        this.sndShoot.play();
        this.transmute(this.currentIsotope.protons, this.currentIsotope.neutrons + 1);
    }

    actionElectron() {
        if (!this.currentIsotope || this.isLevelComplete) return;
        this.sndShoot.play();
        this.transmute(this.currentIsotope.protons - 1, this.currentIsotope.neutrons + 1);
    }

    transmute(newProtons, newNeutrons) {
        const mass = newProtons + newNeutrons;
        const sym = this.getSymbolByProtons(newProtons);
        const isoName = `${sym}-${mass}`;

        if (this.isotopesDB[isoName]) {
            // Calculate delta for smooth animation Before updating value
            const deltaP = newProtons - this.currentIsotope.protons;
            const deltaN = newNeutrons - this.currentIsotope.neutrons;

            // Instantly apply state change
            this.setElement(isoName);

            // Animate grid sliding
            // Shift container in the opposite direction of the visual change to feign camera movement
            const startX = this.gridContainer.x - (deltaN * this.tileSize);
            const startY = this.gridContainer.y + (deltaP * this.tileSize);

            this.gridContainer.setPosition(startX, startY);

            // Remove existing tweens on gridContainer to allow spamming
            this.tweens.killTweensOf(this.gridContainer);
            this.tweens.add({
                targets: this.gridContainer,
                x: 0,
                y: 0,
                duration: 250, // Slightly longer duration for smoother fade-in
                ease: 'Cubic.out' // Using Cubic.out for a silkier slide
            });

        } else {
            // Unstable/Unknown configuration, shake
            this.cameras.main.shake(100, 0.01);
            console.log(`Lost track! Tried to make ${isoName}`);
        }
    }

    getSymbolByProtons(protons) {
        for (let key in this.isotopesDB) {
            if (this.isotopesDB[key].protons === protons) {
                return key.split('-')[0];
            }
        }
        return "Unknown";
    }

    calculateGameDecayTime(halfLifeSeconds) {
        if (halfLifeSeconds <= 0) return 0;

        // log10(0.001) = -3 -> 1.0 + (-3/6) = 0.5s -- Wait, scaling requested:
        // 1ms -> 0.5s. log10(1e-3) = -3. If formula is: 1 + log10(t)/something = 0.5 => log10(t)/something = -0.5 => -3/X = -0.5 => X = 6
        // 1s -> 1s. log10(1) = 0. 1 + 0 = 1s.
        // 1000s -> 2s. log10(1e3) = 3. 1 + 3/X = 2 => 3/X = 1 => X = 3
        // Actually, the user asked: 0.5s for 1ms, 1s for 1s, 2s for 1000s.
        // Wait, log10(t) is -3, 0, 3. 
        // A linear interpolation of log10(t): 
        // log=0 -> 1s
        // log=-3 -> 0.5s => slope = 0.5 / 3 = 1/6
        // log=3 -> 2s => slope is not linear if we use 1/6?  1 + 3*(1/6) = 1.5s
        // Wait, 1 + log10(t)/3:  -3/3 = -1 -> 0s. 3/3 = 1 -> 2s.
        // So a piecewise or a slightly adjusted formula is needed:
        // Let y = a * log10(t) + b
        // -3a + b = 0.5
        // 0a + b = 1  => b = 1
        // 3a + 1 = 2 => 3a = 1 => a = 1/3
        // So for t=1ms (-3), 1 + (-3)*(1/3) = 0. Which doesn't match 0.5.
        // Let's just use:
        // if log < 0: 1 + log/6
        // if log >= 0: 1 + log/3

        let logVal = Math.log10(halfLifeSeconds);
        let gameSeconds = 1.0;
        if (logVal < 0) {
            gameSeconds = 1.0 + (logVal / 6.0); // -3 -> 0.5
        } else {
            gameSeconds = 1.0 + (logVal / 3.0); // 3 -> 2.0
        }

        if (gameSeconds < 0.1) gameSeconds = 0.1;

        return gameSeconds * 1000;
    }

    setElement(isotopeName) {
        if (this.isotopesDB[isotopeName]) {
            this.currentIsotope = { id: isotopeName, ...this.isotopesDB[isotopeName] };

            this.isStable = this.currentIsotope.halfLife === -1;
            if (!this.isStable) {
                this.decayTimeLeft = this.calculateGameDecayTime(this.currentIsotope.halfLife);
            } else {
                this.decayTimeLeft = 0;
            }

            this.updateGrid();
            this.checkWinCondition();
        } else {
            console.warn(`Isotope ${isotopeName} not found in DB!`);
        }
    }

    getDecayColor(decayMode) {
        switch (decayMode) {
            case "None": return 0x000000; // Black for stable
            case "Beta-": return 0x66c2ff; // Light Blue
            case "Beta+": return 0xff99cc; // Pink
            case "Alpha": return 0xffff66; // Yellow
            case "Proton": return 0xff9966; // Light Orange
            case "Neutron": return 0xcc99ff; // Purple
            default: return 0xaaddaa; // Fallback
        }
    }

    updateGrid() {
        if (!this.currentIsotope) return;
        this.hideTooltip();

        // Clear previous grid
        this.gridContainer.removeAll(true);

        const width = this.sys.game.config.width;
        const centerX = width / 2;

        // Compute Title Banner Height to offset the Grid below it
        const spacing = 5;
        const bannerTileSize = Math.floor(Math.min(50, (width - 20 - spacing * 5) / 6));
        const bannerBottomY = (bannerTileSize / 2 + 10) + (bannerTileSize / 2) + 20; // safe margin

        // Place Game Grid Center just below banner instead of screen vertical center, and offset 64 pixels down
        const centerY = bannerBottomY + (3 * this.tileSize) + 10 + 64;

        // Ensure the grid container is correctly zeroed since we offset the tiles directly
        this.gridContainer.setPosition(0, 0);

        const currP = this.currentIsotope.protons;
        const currN = this.currentIsotope.neutrons;

        // We want a 7x7 grid -> +/- 3 around the center
        const range = 3;

        // Create 7x7 tiles
        for (let dP = -range; dP <= range; dP++) {
            for (let dN = -range; dN <= range; dN++) {

                const targetP = currP + dP;
                const targetN = currN + dN;
                const targetMass = targetP + targetN;
                const targetSym = this.getSymbolByProtons(targetP);
                const targetIsoName = `${targetSym}-${targetMass}`;
                const isoData = this.isotopesDB[targetIsoName];

                // Position formulas
                // Z (Protons) increases Upwards -> centerY - (dP * tileSize)
                // N (Neutrons) increases Rightwards -> centerX + (dN * tileSize)
                const tileX = centerX + (dN * this.tileSize);
                const tileY = centerY - (dP * this.tileSize);

                let tileColor = 0xb0c4de; // Default bg-greyish for empty/unknown
                let borderThickness = 1;
                let borderColor = 0xffffff;
                let textStr = "";

                if (isoData) {
                    tileColor = this.getDecayColor(isoData.decayMode);
                    textStr = `${targetSym}\n${targetMass}`;

                    // Highlight the central (current) isotope
                    if (dP === 0 && dN === 0) {
                        borderThickness = 4;
                        borderColor = 0xff0000; // Red border to indicate it's the active one
                    }
                }

                // Base tile
                const rect = this.add.rectangle(tileX, tileY, this.tileSize, this.tileSize, tileColor);
                rect.setStrokeStyle(borderThickness, borderColor);

                if (isoData) {
                    rect.setInteractive();
                    const isCenter = (dP === 0 && dN === 0);
                    rect.on('pointerover', (pointer) => {
                        this.showTooltip(isoData, targetSym, targetMass, isCenter, pointer);
                    });
                    rect.on('pointerout', () => {
                        this.hideTooltip();
                    });
                }

                // Label
                const labelColor = (isoData && isoData.decayMode === "None") ? '#ffffff' : '#000000';
                const label = this.add.text(tileX, tileY, textStr, {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: labelColor,
                    align: 'center',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                this.gridContainer.add([rect, label]);
            }
        }
    }

    loadLevel(index) {
        if (index >= this.levelsData.length) {
            this.levelText.setText("Félicitations !\nVous avez complété tous les niveaux de cette démo.");
            this.nextLevelButton.setVisible(false);
            this.isLevelComplete = true; // block input
            return;
        }

        this.currentLevelIndex = index;
        const level = this.levelsData[index];
        this.isLevelComplete = false;
        this.nextLevelButton.setVisible(false);

        this.levelText.setText(`[Niveau ${level.id}] ${level.title}\nObjectif: Atteindre un isotope stable de ${level.targetElement}\n=> ${level.description}`);

        // Clear tweens and immediately reset grid position
        this.tweens.killTweensOf(this.gridContainer);
        this.gridContainer.setPosition(0, 0);

        this.setElement(level.startIsotope);
    }

    checkWinCondition() {
        if (this.isLevelComplete || !this.levelsData || this.currentLevelIndex >= this.levelsData.length) return;

        const level = this.levelsData[this.currentLevelIndex];
        const sym = this.currentIsotope.id.split('-')[0];

        // Victory if we reached the target element and it's stable
        if (sym === level.targetElement && this.isStable) {
            this.isLevelComplete = true;
            this.sndWin.play();
            this.levelText.setText(`[SUCCÈS] ${level.title}\nValidé ! Vous avez atteint ${this.currentIsotope.name}.`);
            this.levelText.setColor('#00ff00');
            this.nextLevelButton.setVisible(true);
        }
    }

    updateTooltipPosition(pointer) {
        let tx = pointer.x + 15;
        let ty = pointer.y + 15;
        const b = this.tooltipText.getBounds();
        if (tx + b.width + 20 > this.sys.game.config.width) {
            tx = pointer.x - b.width - 25;
        }
        if (ty + b.height + 20 > this.sys.game.config.height) {
            ty = pointer.y - b.height - 25;
        }
        this.tooltipContainer.setPosition(tx, ty);
    }

    showTooltip(iso, symbol, mass, isCurrent, pointer) {
        let stabilityTxt = (iso.halfLife === -1) ? "STABLE" : `Half-Life: ${iso.halfLife} s\nDecay: ${iso.decayMode}`;
        if (isCurrent && iso.halfLife !== -1) {
            stabilityTxt += `\nTime Left: ${(this.decayTimeLeft / 1000).toFixed(1)}s`;
        }

        this.tooltipText.setText(
            `${iso.name} (${symbol}-${mass})\n` +
            `Protons (Z) : ${iso.protons}\n` +
            `Neutrons (N): ${iso.neutrons}\n` +
            `------------------\n` +
            `${stabilityTxt}`
        );

        const b = this.tooltipText.getBounds();
        this.tooltipBg.setSize(b.width + 20, b.height + 20);
        this.tooltipContainer.setVisible(true);
        this.hoveredIsotope = { iso, symbol, mass, isCurrent };

        if (pointer) {
            this.updateTooltipPosition(pointer);
        }
    }

    hideTooltip() {
        if (this.tooltipContainer) {
            this.tooltipContainer.setVisible(false);
            this.hoveredIsotope = null;
        }
    }

    triggerDecay() {
        if (!this.currentIsotope) return;

        let p = this.currentIsotope.protons;
        let n = this.currentIsotope.neutrons;
        const mode = this.currentIsotope.decayMode;

        if (mode === 'Alpha') {
            p -= 2; n -= 2;
        } else if (mode === 'Beta-') {
            n -= 1; p += 1;
        } else if (mode === 'Beta+') {
            p -= 1; n += 1;
        } else if (mode === 'Proton') {
            p -= 1;
        } else if (mode === 'Neutron') {
            n -= 1;
        }

        // Use transmute to ensure we get the smooth sliding animation
        this.transmute(p, n);

        // Add a red flash specifically for automatic decays to make them feel impactful
        this.sndDecay.play();
        this.cameras.main.flash(150, 255, 0, 0);
    }

    update(time, delta) {
        if (!this.isStable && this.decayTimeLeft > 0) {
            this.decayTimeLeft -= delta;

            if (this.tooltipContainer && this.tooltipContainer.visible && this.hoveredIsotope && this.hoveredIsotope.isCurrent) {
                this.showTooltip(this.hoveredIsotope.iso, this.hoveredIsotope.symbol, this.hoveredIsotope.mass, true);
            }

            if (this.decayTimeLeft <= 0) {
                this.decayTimeLeft = 0;
                this.triggerDecay();
            }
        }
    }
}
