import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_3 extends BaseGameScene {
    constructor() {
        super('GameScene_3');
    }

    preload() {
        const path = 'assets/images/Game_3/';

        this.load.image('game3_npc_box_win', `${path}game3_npc_box2.png`);
        this.load.image('game3_npc_box_win1', `${path}game3_npc_box3.png`);
        this.load.image('game3_npc_box_tryagain', `${path}game3_npc_box4.png`);

        // Buttons
        this.load.image('game3_button_blue', `${path}game3_button_blue.png`);
        this.load.image('game3_button_green', `${path}game3_button_green.png`);
        this.load.image('game3_button_red', `${path}game3_button_red.png`);
        this.load.image('game3_button_yellow', `${path}game3_button_yellow.png`);

        // peachs
        this.load.image('game3_bar_peach_blue', `${path}game3_bar_peach_blue.png`);
        this.load.image('game3_bar_peach_green', `${path}game3_bar_peach_green.png`);
        this.load.image('game3_bar_peach_red', `${path}game3_bar_peach_red.png`);
        this.load.image('game3_bar_peach_yellow', `${path}game3_bar_peach_yellow.png`);

        this.load.image('game3_object_description', `${path}game3_object_description.png`);

        // Other UI
        this.load.image('game3_bar_bg', `${path}game3_bar_bg.png`);
        this.load.image('game3_hit_point', `${path}game3_hit_point.png`);

    }

    create() {
        // Initialize dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.barBG = this.add.image(960, 540, 'game3_bar_bg').setDepth(20);
        this.hitPoint = this.add.image(1000, 520, 'game3_hit_point').setDepth(30)
            .setVisible(false).setScale(0);

        this.initGame('game3_bg', 'game3_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 30,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 3
        });

        this.gameUI.descriptionPanel.setCloseCallBack(() => {
            this.startGame();
        });

    }

    setupGameObjects() {
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;
        this.isWin = false;
        this.spawnSpeed = 3;
        this.currentIndex = 0;
        this.fallingpeachs = [];
        this.hitPointTimer = null;

        if (this.buttonGroup) {
            if (this.buttonGroup.scene) {
                this.buttonGroup.destroy(true);
            }
        }
        if (this.peachGroup) {
            if (this.peachGroup.scene) {
                this.peachGroup.destroy(true);
            }
        }

        this.buttonGroup = this.add.group();
        this.peachGroup = this.add.group();
        const colors = ['blue', 'green', 'red', 'yellow'];
        for (let i = 0; i < 4; i++) {
            const button = new CustomButton(this, 520 + i * 300, 780, `game3_button_${colors[i]}`, `game3_button_${colors[i]}`,
                () => {
                    this.handlepeachClick(i);
                }).setDepth(25);
            this.buttonGroup.add(button);
        }

        for (let i = 0; i < colors.length; i++) {
            const peach = this.add.image(960, -100, `game3_bar_peach_${colors[i]}`).setDepth(23);
            this.peachGroup.add(peach);
        }

    }
    update() {
        if (this.canSpawn) {
            if (!this.fallingpeachs || this.fallingpeachs.length < 2) {
                this.spawnpeach();
            }

            if (!this.fallingpeachs) return;


            if (!this.spawnHitPoint && !this.hitPointTimer) {
                this.hitPointTimer = this.time.delayedCall(2000, () => {
                    this.hitPointTimer = null;
                    if (this.canSpawn && !this.spawnHitPoint) {
                        this.showHitPoint();
                        this.spawnHitPoint = true;
                    }
                });
            }


            for (let i = this.fallingpeachs.length - 1; i >= 0; i--) {
                const peach = this.fallingpeachs[i];
                peach.x -= this.spawnSpeed;
                if (!peach.visible && peach.x <= 1620) {
                    peach.setVisible(true);
                }
                if (peach.x < 200) {
                    peach.destroy();
                    this.fallingpeachs.splice(i, 1);
                }
            }

        }
    }

    enableGameInteraction(enable) {
        this.canSpawn = enable;
        if (enable) {
            this.spawnHitPoint = false;
            this.isHitPointValid = false;
        }

        if (this.buttonGroup) {
            this.buttonGroup.setVisible(enable);
            this.buttonGroup.getChildren().forEach(button => {
                if (enable) {
                    button.setInteractive();
                } else {
                    button.disableInteractive();
                }
            });
        }
        if (this.barBG)
            this.barBG.setVisible(enable);

    }

    showHitPoint() {
        if (this.isWin || this.spawnHitPoint) return;

        this.isHitPointValid = true;
        // Ensure hitPoint is visible and starts from scale 0 so tween is visible
        if (this.hitPoint) {
            this.hitPoint.setVisible(true).setScale(0);
        }
        this.tweens.add({
            targets: this.hitPoint,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });

        // Debug: draw hit zone rectangle for testing
        // this.clearDebugHitZone();
        // const debugSize = 160;
        // this.debugHitRect = this.add.graphics();
        // this.debugHitRect.lineStyle(2, 0x00ff00, 0.8);
        // this.debugHitRect.strokeRect(this.hitPoint.x - debugSize / 2, this.hitPoint.y - debugSize / 2, debugSize, debugSize);
        // this.debugHitRect.setDepth(60);


        this.time.delayedCall(2000, () => {
            if (this.hitPoint) {
                this.tweens.add({
                    targets: this.hitPoint,
                    scale: 0,
                    duration: 500,
                    ease: 'Back.in',
                });;
                // remove debug rectangle when hit point hides
                this.clearDebugHitZone();
            }
            this.time.delayedCall(500, () => {
                this.isHitPointValid = false;
            });
        });

        this.time.delayedCall(2000, () => {
            this.spawnHitPoint = false;
        });
    }

    clearDebugHitZone() {
        if (this.debugHitRect) {
            try { this.debugHitRect.destroy(); } catch (e) { }
            this.debugHitRect = null;
        }
    }

    spawnpeach() {
        if (!this.fallingpeachs) this.fallingpeachs = [];
        //console.log('Spawning peach ');
        const colors = ['blue', 'green', 'red', 'yellow'];
        const gap = 200;
        let startX;

        if (this.fallingpeachs.length > 0) {
            const rightMostpeach = this.fallingpeachs.reduce((
                max, peach) => peach.x > max.x ? peach : max, this.fallingpeachs[0]);
            startX = Math.max(rightMostpeach.x, 1620);
        } else {
            startX = 800; // initial spawn starts inside the visible bar
        }



        const BAR_RIGHT_X = 1620;
        for (let i = 1; i <= 15; i++) {
            const randomIndex = Phaser.Math.Between(0, colors.length - 1);
            const color = colors[randomIndex];
            const peachX = startX + (i * gap);
            const peach = this.add.image(peachX, 540, `game3_bar_peach_${color}`).setDepth(24);
            peach.colorIndex = randomIndex;
            peach.setVisible(peachX <= BAR_RIGHT_X);
            this.fallingpeachs.push(peach);
        }

    }

    handlepeachClick(index) {
        if (!this.fallingpeachs || this.fallingpeachs.length === 0) return;

        // Collider-based hit detection: check rectangle overlap between hitPoint and peachs
        let winRound = false;
        let hitIndex = -1;
        if (this.isHitPointValid && this.hitPoint && this.fallingpeachs && this.fallingpeachs.length) {
            const hitRect = this.hitPoint.getBounds();
            for (let i = 0; i < this.fallingpeachs.length; i++) {
                const peach = this.fallingpeachs[i];
                if (peach.colorIndex !== index) continue;
                const peachRect = peach.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(hitRect, peachRect)) {
                    hitIndex = i;
                    break;
                }
            }

            if (hitIndex !== -1) {
                const peach = this.fallingpeachs[hitIndex];
                console.log('Win round');
                winRound = true;
            } else {
                console.log('No overlapping matching peach. peachs:', this.fallingpeachs.map(a => ({ x: Math.round(a.x), color: a.colorIndex })));
            }
        } else {
            if (!this.isHitPointValid) console.log('Hit attempted but hit point not valid');
        }

        // Common cleanup: destroy peachs, hitPoint, and hide barBG
        for (let i = 0; i < this.fallingpeachs.length; i++) {
            this.fallingpeachs[i].destroy();
        }
        this.fallingpeachs = [];
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;

        if (this.hitPointTimer) {
            this.hitPointTimer.remove(false);
            this.hitPointTimer = null;
        }

        this.enableGameInteraction(false);

        if (winRound) {

            this.roundIndex = this.currentIndex;
            this.onRoundWin();
            this.currentIndex++;

            if (this.hitPoint) {

                try { this.tweens.killTweensOf(this.hitPoint); } catch (e) { }
                this.hitPoint.setScale(0).setVisible(false);
            }
            //   this.clearDebugHitZone();
        } else {
            this.roundIndex = this.currentIndex;
            this.handleLose();
        }
    }



    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        console.log(`Round ${this.roundIndex + 1} Win!`);

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.enableGameInteraction(false);

        if (isFinalWin) {
            this.canSpawn = false;
            this._calculateTiming(true);
            this.gameTimer.stop();
            this.showBubble('win');
            this.showFeedbackLabel(true);
        } else {
            this.canSpawn = true;
            this.enableGameInteraction(true);
        }
        this.updateRoundUI(true);
    }


    onWinBubbleClose() {
        const centerX = this.cameras.main.width / 2;

        this.nextDialog = this.add.image(this.centerX, this.cameras.main.height * 0.8, 'game3_npc_box_win1').setDepth(1000);
        this.nextDialog.setInteractive({ useHandCursor: true });
        this.nextDialog.once('pointerdown', () => {
            this.nextDialog.destroy();
            this.showObjectPanel();
        });
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game3_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }


    resetForNewRound() {
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;
        this.isWin = false;
        this.currentIndex = 0;

        if (this.hitPointTimer) {
            this.hitPointTimer.remove(false);
            this.hitPointTimer = null;
        }

        if (this.hitPoint) {
            this.hitPoint.setVisible(false).setScale(0);
        }

        // Ensure debug overlay is removed when resetting rounds
        this.clearDebugHitZone();

        if (this.fallingpeachs) {
            for (let i = this.fallingpeachs.length - 1; i >= 0; i--) {
                const peach = this.fallingpeachs[i];
                if (peach) {
                    peach.destroy();
                }
            }
        }
        this.fallingpeachs = [];

        if (this.progressSuccess) {
            this.progressSuccess.destroy();
            this.progressSuccess = null;
        }
        if (this.progressFail) {
            this.progressFail.destroy();
            this.progressFail = null;
        }
        if (this.progressIcon) {
            const barLeftX = this.progressWidth ? 960 - this.progressWidth / 2 : 600;
            this.progressIcon.x = barLeftX;
        }
        this.canSpawn = true;
    }
}

