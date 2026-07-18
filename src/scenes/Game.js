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

        // Resource properties
        this.remainingNeutrons = 0;
        this.remainingElectrons = 0;
        this.maxNeutrons = 0;
        this.maxElectrons = 0;
        this.isGameOver = false;

        // UI elements
        this.statusBar = null;
        this.statusBarExpanded = false;
        this.descriptionText = null;
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
        this.load.audio('sfx_lose', 'assets/audio/explosion.wav');
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
        this.sndLose = this.sound.add('sfx_lose', { volume: 0.7 });

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

        // Setup dynamic tile size based on screen width
        this.updateTileSize();

        // Level data
        this.levelsData = this.cache.json.get('levels');

        // Create Status Bar (compact UI at top)
        this.createStatusBar();

        // Title Banner (I-S-O-Te-P-Es)
        this.createTitleBanner();

        // Resource UI (Top Right)
        this.resourceText = this.add.text(
            this.sys.game.config.width - 10,
            10,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                align: 'right',
                backgroundColor: '#00000080',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(1, 0);
        this.resourceText.setDepth(100);





        // Initialize Level 0 or fallback to sandbox
        if (this.levelsData && this.levelsData.length > 0) {
            this.loadLevel(0);
        } else {
            this.setElement('Pb-208');
        }


        // Disable default right-click context menu
        this.input.mouse.disableContextMenu();

        // Handle Input via buttons ONLY (no grid clicks, no keyboard)
        // Pointer down on grid does nothing - only button clicks work
        this.input.on('pointerdown', (pointer) => {
            if (this.isLevelComplete || this.isGameOver) return;
            // Only button clicks trigger actions, grid clicks are ignored
        });

        // Handle resize
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;

            this.bg.setPosition(width / 2, height / 2);
            this.bg.setDisplaySize(width, height);

            this.updateTileSize();

            this.coreGraphics.setPosition(width / 2, height / 2);
            this.coreGraphics.body.updateFromGameObject();



            // Recreate status bar and title banner
            this.createStatusBar();
            this.createTitleBanner();

            this.updateGrid(); // Redraw grid on center
        });
    }

    createStatusBar() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const size = this.tileSize;
        const barHeight = size + 10;
        const barY = height - barHeight;

        // Clean up existing status bar
        if (this.statusBar) {
            this.statusBar.destroy();
            this.statusBar = null;
        }
        if (this.descriptionText) {
            this.descriptionText.destroy();
            this.descriptionText = null;
        }
        if (this.startIconContainer) {
            this.startIconContainer.destroy();
            this.startIconContainer = null;
        }
        if (this.targetIconContainer) {
            this.targetIconContainer.destroy();
            this.targetIconContainer = null;
        }
        if (this.neutronButton) {
            this.neutronButton.destroy();
            this.neutronButton = null;
        }
        if (this.electronButton) {
            this.electronButton.destroy();
            this.electronButton = null;
        }
        if (this.restartButton) {
            this.restartButton.destroy();
            this.restartButton = null;
        }
        if (this.nextLevelButton) {
            this.nextLevelButton.destroy();
            this.nextLevelButton = null;
        }

        // Create background rectangle at bottom
        const bgRect = this.add.rectangle(0, barY, width, barHeight, 0x000000, 0.8);
        bgRect.setOrigin(0, 0);

        // Level title text (clickable to toggle description)
        const currentLevel = this.levelsData && this.levelsData[this.currentLevelIndex];
        const titleText = currentLevel ? `[Niveau ${currentLevel.id}] ${currentLevel.title}` : 'Isotope';
        this.levelTitleText = this.add.text(20, barY + barHeight / 2, titleText, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0.5);
        this.levelTitleText.setInteractive();
        this.levelTitleText.on('pointerdown', (pointer) => {
            if (pointer.button === 0) { // Left click only
                this.toggleStatusBar();
            }
        });

        // Restart Button Container (🔄)
        this.restartButton = this.add.container(0, 0);
        this.restartButtonBg = this.add.rectangle(0, 0, size, size, 0x8B4513);
        this.restartButtonBg.setStrokeStyle(2, 0xffffff);
        this.restartButtonBg.setInteractive({ useHandCursor: true });
        this.restartButtonText = this.add.text(0, 0, '🔄', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.45) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.restartButtonBg.on('pointerdown', (pointer) => {
            if (pointer.button === 0) {
                this.loadLevel(this.currentLevelIndex);
            }
        });
        this.restartButton.add([this.restartButtonBg, this.restartButtonText]);
        this.restartButton.setVisible(false);

        // Start Isotope Icon Container
        this.startIconContainer = this.add.container(0, 0);
        this.startIconBg = this.add.rectangle(0, 0, size, size, 0x000000);
        this.startIconBg.setStrokeStyle(1, 0xffffff);
        this.startIconText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.3) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.startIconContainer.add([this.startIconBg, this.startIconText]);

        // Neutron button container (⚛)
        this.neutronButton = this.add.container(0, 0);
        this.neutronButtonBg = this.add.rectangle(0, 0, size, size, 0x00008B);
        this.neutronButtonBg.setStrokeStyle(2, 0xffffff);
        this.neutronButtonBg.setInteractive({ useHandCursor: true });
        this.neutronButtonText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.3) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.neutronButtonBg.on('pointerdown', (pointer) => {
            if (pointer.button === 0) {
                this.actionNeutron();
            }
        });
        this.neutronButton.add([this.neutronButtonBg, this.neutronButtonText]);

        // Electron button container (⚡)
        this.electronButton = this.add.container(0, 0);
        this.electronButtonBg = this.add.rectangle(0, 0, size, size, 0x8B008B);
        this.electronButtonBg.setStrokeStyle(2, 0xffffff);
        this.electronButtonBg.setInteractive({ useHandCursor: true });
        this.electronButtonText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.3) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.electronButtonBg.on('pointerdown', (pointer) => {
            if (pointer.button === 0) {
                this.actionElectron();
            }
        });
        this.electronButton.add([this.electronButtonBg, this.electronButtonText]);

        // Target Isotope Icon Container
        this.targetIconContainer = this.add.container(0, 0);
        this.targetIconBg = this.add.rectangle(0, 0, size, size, 0x000000);
        this.targetIconBg.setStrokeStyle(1, 0xffffff);
        this.targetIconText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.3) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.targetIconContainer.add([this.targetIconBg, this.targetIconText]);

        // Next Level Button Container (➡️)
        this.nextLevelButton = this.add.container(0, 0);
        this.nextLevelButtonBg = this.add.rectangle(0, 0, size, size, 0x2E8B57);
        this.nextLevelButtonBg.setStrokeStyle(2, 0xffffff);
        this.nextLevelButtonBg.setInteractive({ useHandCursor: true });
        this.nextLevelButtonText = this.add.text(0, 0, '➡️', {
            fontFamily: 'Arial',
            fontSize: Math.floor(size * 0.45) + 'px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.nextLevelButtonBg.on('pointerdown', (pointer) => {
            if (pointer.button === 0) {
                this.loadLevel(this.currentLevelIndex + 1);
            }
        });
        this.nextLevelButton.add([this.nextLevelButtonBg, this.nextLevelButtonText]);
        this.nextLevelButton.setVisible(false);

        // Description text (hidden by default, above the bar when expanded)
        this.descriptionText = this.add.text(20, barY - 10, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            align: 'left',
            backgroundColor: '#000000cc',
            padding: { x: 10, y: 10 },
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 1).setVisible(false);

        // Create container for status bar elements
        this.statusBar = this.add.container(0, 0, [
            bgRect,
            this.levelTitleText,
            this.restartButton,
            this.startIconContainer,
            this.neutronButton,
            this.electronButton,
            this.targetIconContainer,
            this.nextLevelButton,
            this.descriptionText
        ]);
        this.statusBar.setDepth(100);

        this.statusBarExpanded = false;
    }

    updateStatusBar() {
        if (!this.levelsData || this.currentLevelIndex >= this.levelsData.length) return;

        const level = this.levelsData[this.currentLevelIndex];
        this.levelTitleText.setText(`[Niveau ${level.id}] ${level.title}`);
        this.descriptionText.setText(level.description);

        // Update Start Isotope Icon
        const startIsoName = level.startIsotope;
        const startIsoData = this.isotopesDB[startIsoName] || { decayMode: 'None', protons: 0, neutrons: 0 };
        const startSym = startIsoName.split('-')[0];
        const startMass = startIsoName.split('-')[1];

        if (this.startIconBg) {
            this.startIconBg.setFillStyle(this.getDecayColor(startIsoData.decayMode));
        }
        if (this.startIconText) {
            this.startIconText.setText(`${startSym}\n${startMass}`);
            this.startIconText.setColor(startIsoData.decayMode === "None" ? '#ffffff' : '#000000');
        }

        // Update Target Isotope Icon
        const targetIsoName = level.targetIsotope;
        const targetIsoData = this.isotopesDB[targetIsoName] || { decayMode: 'None', protons: 0, neutrons: 0 };
        const targetSym = targetIsoName ? targetIsoName.split('-')[0] : "";
        const targetMass = targetIsoName ? targetIsoName.split('-')[1] : "";

        if (this.targetIconBg) {
            this.targetIconBg.setFillStyle(this.getDecayColor(targetIsoData.decayMode));
        }
        if (this.targetIconText) {
            this.targetIconText.setText(`${targetSym}\n${targetMass}`);
            this.targetIconText.setColor(targetIsoData.decayMode === "None" ? '#ffffff' : '#000000');
        }

        // Update Buttons Text and Visibility based on Game State
        const showActions = !this.isGameOver;
        const showRestart = this.isGameOver;
        const showNext = this.isGameOver && this.isVictory;

        if (this.neutronButtonText) {
            this.neutronButtonText.setText(`⚛\n${this.remainingNeutrons}/${this.maxNeutrons}`);
        }
        if (this.neutronButton) {
            this.neutronButton.setVisible(showActions && this.maxNeutrons > 0);
        }
        if (this.electronButtonText) {
            this.electronButtonText.setText(`⚡\n${this.remainingElectrons}/${this.maxElectrons}`);
        }
        if (this.electronButton) {
            this.electronButton.setVisible(showActions && this.maxElectrons > 0);
        }

        if (this.restartButton) {
            this.restartButton.setVisible(showRestart);
        }
        if (this.nextLevelButton) {
            this.nextLevelButton.setVisible(showNext);
        }

        if (this.startIconContainer) this.startIconContainer.setVisible(true);
        if (this.targetIconContainer) this.targetIconContainer.setVisible(true);

        // Position elements in the middle of the status bar
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const size = this.tileSize;
        const barHeight = size + 10;
        const barY = height - barHeight;

        // Responsive positioning of the level title text
        if (width < 600) {
            this.levelTitleText.setPosition(width / 2, barY - 20);
            this.levelTitleText.setOrigin(0.5, 0.5);
            this.levelTitleText.setBackgroundColor('#000000cc');
            this.levelTitleText.setPadding({ x: 10, y: 5 });
            this.levelTitleText.setAlign('center');
        } else {
            this.levelTitleText.setPosition(20, barY + barHeight / 2);
            this.levelTitleText.setOrigin(0, 0.5);
            this.levelTitleText.setBackgroundColor('#00000000');
            this.levelTitleText.setPadding({ x: 0, y: 0 });
            this.levelTitleText.setAlign('left');
        }

        // Dynamic centering of the group
        const activeContainers = [];
        if (showRestart && this.restartButton) activeContainers.push(this.restartButton);
        activeContainers.push(this.startIconContainer);
        if (showActions && this.maxElectrons > 0 && this.electronButton) activeContainers.push(this.electronButton);
        if (showActions && this.maxNeutrons > 0 && this.neutronButton) activeContainers.push(this.neutronButton);
        activeContainers.push(this.targetIconContainer);
        if (showNext && this.nextLevelButton) activeContainers.push(this.nextLevelButton);

        const spacing = 10;
        const totalWidth = (activeContainers.length * size) + ((activeContainers.length - 1) * spacing);
        const startX = width / 2 - totalWidth / 2 + size / 2;

        activeContainers.forEach((container, index) => {
            if (container) {
                container.setPosition(startX + index * (size + spacing), barY + barHeight / 2);
            }
        });
    }

    toggleStatusBar() {
        if (!this.descriptionText) return;

        this.statusBarExpanded = !this.statusBarExpanded;
        this.descriptionText.setVisible(this.statusBarExpanded);

        // Reposition description text above the status bar
        if (this.statusBarExpanded) {
            const height = this.sys.game.config.height;
            const barHeight = this.tileSize + 10;
            const barY = height - barHeight;
            this.descriptionText.setPosition(20, barY - 10);
        }
    }

    gameOver(isVictory) {
        this.isGameOver = true;
        this.isLevelComplete = !isVictory;
        this.isVictory = isVictory;

        const currentLevel = this.levelsData && this.levelsData[this.currentLevelIndex];
        if (isVictory) {
            this.sndWin.play();
            this.levelTitleText.setColor('#00ff00');
            this.levelTitleText.setText(`[SUCCÈS] ${currentLevel.title}`);
        } else {
            this.sndLose.play();
            this.levelTitleText.setColor('#ff0000');
            this.levelTitleText.setText(`[ÉCHEC] ${currentLevel.title}\nIl vous reste 0 neutrons et 0 électrons.`);
        }

        // Call updateStatusBar to handle button visibility and positioning on Game Over
        this.updateStatusBar();
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

        // Target isotopes to spell I-S-O-Te-P-Es
        const bannerIsotopes = ['I-127', 'S-32', 'O-16', 'Te-120', 'P-31', 'Es-252'];

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
        if (!this.currentIsotope || this.isLevelComplete || this.isGameOver) return;
        if (this.maxNeutrons === 0) return;
        if (this.remainingNeutrons <= 0) return;

        this.remainingNeutrons--;
        this.updateStatusBar();
        this.sndShoot.play();
        this.transmute(this.currentIsotope.protons, this.currentIsotope.neutrons + 1);
    }

    actionElectron() {
        if (!this.currentIsotope || this.isLevelComplete || this.isGameOver) return;
        if (this.maxElectrons === 0) return;
        if (this.remainingElectrons <= 0) return;

        this.remainingElectrons--;
        this.updateStatusBar();
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

            if (this.isStable && !this.isLevelComplete && !this.isGameOver) {
                if (this.remainingNeutrons === 0 && this.remainingElectrons === 0) {
                    this.gameOver(false);
                }
            }
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
            this.levelTitleText.setText("Félicitations !\nVous avez complété tous les niveaux de cette démo.");
            this.nextLevelButton.setVisible(false);
            this.isLevelComplete = true; // block input
            return;
        }

        this.currentLevelIndex = index;
        const level = this.levelsData[index];
        this.isLevelComplete = false;
        this.isGameOver = false;
        this.isVictory = false;

        // Initialize resources
        this.maxNeutrons = level.maxNeutrons !== undefined ? level.maxNeutrons : 10;
        this.maxElectrons = level.maxElectrons !== undefined ? level.maxElectrons : 5;
        this.remainingNeutrons = this.maxNeutrons;
        this.remainingElectrons = this.maxElectrons;

        // Update status bar (which also sets button visibility based on capacity)
        this.updateStatusBar();

        // Clear tweens and immediately reset grid position
        this.tweens.killTweensOf(this.gridContainer);
        this.gridContainer.setPosition(0, 0);

        this.setElement(level.startIsotope);
    }

    checkWinCondition() {
        if (this.isLevelComplete || this.isGameOver || !this.levelsData || this.currentLevelIndex >= this.levelsData.length) return;

        const level = this.levelsData[this.currentLevelIndex];

        // Victory if we reached the target and it is stable
        if (this.currentIsotope.id === level.targetIsotope && this.isStable) {
            this.gameOver(true);
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
