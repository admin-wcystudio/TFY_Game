import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_6 extends BaseGameScene {
    constructor() {
        super('GameScene_6');
    }
    preload() {
        const path = 'assets/images/Game_6/';
        this.load.image('confirm_button', `${path}game6_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game6_confirm_button_select.png`);

        this.load.image('game2_npc_box_mainstreet_01', `${path}game6_npc_box1.png`);
        this.load.image('game2_npc_box_mainstreet_02', `${path}game6_npc_box2.png`);
        this.load.image('game6_npc_box_win', `${path}game6_npc_box3.png`);
        this.load.image('game6_npc_box_win_02', `${path}game6_npc_box4.png`);
        this.load.image('game6_npc_box_tryagain', `${path}game6_npc_box5.png`);


        for (let i = 1; i <= 3; i++) {
            this.load.audio(`music_0${i}`, `${path}MP3/music_0${i}.mp3`);
            this.load.image(`game6_object${i}`, `${path}game6_object${i}.png`);
            this.load.image(`game6_music${i}_button`, `${path}game6_music${i}_button.png`);
            this.load.image(`game6_music${i}_button_select`, `${path}game6_music${i}_button_select.png`);
        }

        this.load.image('game6_border1', `${path}game6_border1.png`);
        this.load.image('game6_border2', `${path}game6_border2.png`);
        this.load.image('game6_border3', `${path}game6_border3.png`);

        this.load.image('game6_success_description1', `${path}game6_success_description1.png`);
        this.load.image('game6_success_description2', `${path}game6_success_description2.png`);

    }

    create() {
        // Initialize dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.isPlayedSound = false;

        this.initGame('game6_bg', 'game6_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: false,
            sceneIndex: 6
        });

        // Create confirm button
        this.confirmBtn = new CustomButton(this, this.centerX, this.height - 100,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });

        this.confirmBtn.setDepth(600).setVisible(false);
    }

    setupGameObjects() {
        this.border1 = this.add.image(this.centerX - 500, this.centerY, 'game6_border1').setDepth(500).setVisible(true);
        this.border2 = this.add.image(this.centerX, this.centerY, 'game6_border2').setDepth(500).setVisible(true);
        this.border3 = this.add.image(this.centerX + 500, this.centerY, 'game6_border3').setDepth(500).setVisible(true);

        this.musicButtons = [];
        for (let i = 1; i <= 3; i++) {
            const musicBtn = new CustomButton(this, this.centerX - 600 + (i - 1) * 500, this.centerY - 240,
                `game6_music${i}_button`, `game6_music${i}_button_select`, () => {
                    console.log(`[MUSIC] Playing music for object ${i}`);
                    this.isPlayedSound = !this.isPlayedSound;
                    if (this.isPlayedSound) {
                        this.PlayMusicForObject(i);
                    } else {
                        this.ResumeMusic();
                    }
                },);
            musicBtn.setDepth(550);
            this.musicButtons.push(musicBtn);
        }

        // Track which object is at each position
        this.positionObjects = {};

        // Border 1 (left) - 3 positions
        this.snapPositions = [
            // Border 1 positions
            { x: this.centerX - 500, y: this.centerY, isOccupied: false },
            // // Border 2 positions
            { x: this.centerX, y: this.centerY, isOccupied: false },
            // // Border 3 positions
            { x: this.centerX + 500, y: this.centerY, isOccupied: false },

        ];

        this.snapRadius = 80; // Distance threshold for snapping

        const spawnPositions = [
            { x: this.centerX - 500, y: this.centerY + 300 },
            { x: this.centerX, y: this.centerY + 300 },
            { x: this.centerX + 500, y: this.centerY + 300 }
        ];



        const shuffledPositions = Phaser.Utils.Array.Shuffle([...spawnPositions]);

        this.objects = [];
        for (let i = 1; i <= 3; i++) {
            const pos = shuffledPositions[i - 1];
            const obj = this.add.image(pos.x, pos.y, `game6_object${i}`)
                .setDepth(505)
                .setInteractive({ draggable: true })
                .setVisible(true);

            obj.objectId = i;
            obj.originalX = pos.x;
            obj.originalY = pos.y;

            this.objects.push(obj);
        }
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // Add dragend event for snapping
        this.input.on('dragend', (pointer, gameObject) => {
            const result = this.findNearestSnapPosition(gameObject.x, gameObject.y, gameObject);
            if (result.snapPos) {
                // Snap to position with animation
                this.tweens.add({
                    targets: gameObject,
                    x: result.snapPos.x,
                    y: result.snapPos.y,
                    duration: 150,
                    ease: 'Power2',
                    onComplete: () => {
                        // Check if all border 1 positions are occupied
                        this.checkIfAllOccupied();
                    }
                });
            } else {
                console.log(`[SNAP] No snap position found within ${this.snapRadius}px radius`);
            }
        });

        this.border1_correctObjects = [2];
        this.border2_correctObjects = [1];
        this.border3_correctObjects = [3];
        //  this.drawDebug();

    }

    PlayMusicForObject(objectId) {

        //Stop bgm first && all music
        if (this.sound.getAll('bgm').length === 0) {
            this.sound.stopByKey('bgm');
        }

        if (this.sound.isPlaying) {
            this.sound.stopAll();
        }
        this.sound.play(`music_0${objectId}`, { loop: true, volume: 0.2 });

    }
    ResumeMusic() {
        this.sound.stopAll();

        this.sound.play('bgm', { loop: true, volume: 0.2 });
    }

    findNearestSnapPosition(x, y, gameObject = null) {
        let nearestPos = null;
        let nearestIndex = -1;
        let minDistance = this.snapRadius;

        for (let i = 0; i < this.snapPositions.length; i++) {
            const pos = this.snapPositions[i];
            // Skip occupied positions unless it's occupied by the same object (moving within its own slot)
            if (pos.isOccupied) {
                const assignedId = this.positionObjects[i];
                if (!gameObject || assignedId !== gameObject.objectId) {
                    continue;
                }
            }

            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPos = pos;
                nearestIndex = i;
            }
        }

        if (nearestPos && gameObject) {
            // Remove this object from any previous position
            Object.keys(this.positionObjects).forEach(key => {
                if (this.positionObjects[key] === gameObject.objectId) {
                    delete this.positionObjects[key];
                    this.snapPositions[key].isOccupied = false;
                }
            });

            // Track this object at the new position
            this.positionObjects[nearestIndex] = gameObject.objectId;
            nearestPos.isOccupied = true;
        }

        return { snapPos: nearestPos, index: nearestIndex };
    }

    checkIfAllOccupied() {
        const allPositions = [0, 1, 2];
        const allOccupied = allPositions.every(i => this.positionObjects.hasOwnProperty(i));

        if (allOccupied) {
            console.log('[CHECK] All positions occupied (all 3 borders)!');
            console.log('[CHECK] Current positions:', this.positionObjects);
            console.log('[CHECK] Click confirm button to check answer');
        }
    }

    enableGameInteraction(enable) {
        this.objects.forEach((obj, index) => {
            obj.setVisible(enable);
            obj.setInteractive(enable);
            if (enable) {
                console.log(`[INTERACTION] Object ${obj.objectId} at (${Math.round(obj.x)}, ${Math.round(obj.y)}) - visible: ${obj.visible}, interactive: ${obj.input ? obj.input.enabled : 'no input'}`);
            }
        });
        if (this.confirmBtn) {
            this.confirmBtn.setVisible(enable);
            console.log(`[INTERACTION] Confirm button visibility: ${enable}`);
        }
    }

    checkAnswer() {
        console.log('[ANSWER] Checking answer...');


        const border1Positions = [0];
        const border1Objects = border1Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        const border2Positions = [1];
        const border2Objects = border2Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        const border3Positions = [2];
        const border3Objects = border3Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        // Check if border 1 has all correct objects
        const border1Correct = this.border1_correctObjects.every(objId => border1Objects.includes(objId)) &&
            border1Objects.length === this.border1_correctObjects.length;

        // Check if border 2 has all correct objects
        const border2Correct = this.border2_correctObjects.every(objId => border2Objects.includes(objId)) &&
            border2Objects.length === this.border2_correctObjects.length;

        // Check if border 3 has all correct objects
        const border3Correct = this.border3_correctObjects.every(objId => border3Objects.includes(objId)) &&
            border3Objects.length === this.border3_correctObjects.length;

        if (border1Correct && border2Correct && border3Correct) {
            console.log('[ANSWER] ✓ All objects correctly placed in all borders!');
            this.onRoundWin();
            this.ResumeMusic();
            console.log(this.gameState);

        } else {
            console.log('[ANSWER] ✗ Incorrect placement!');
            this.handleLose();
        }
    }

    handleLose() {
        // Prevent multiple entries
        if (this.gameState === 'gameLose') return;

        this.ResumeMusic();

        this.currentFailCount = (this.currentFailCount || 0) + 1; // Increment fail count

        // Standard Logic
        this.isGameActive = false;
        this.gameState = 'lose';

        this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
        if (this.gameTimer) this.gameTimer.stop();
        this.enableGameInteraction(false);
        this.updateRoundUI(false);
        this.showBubble('tryagain');

    }

    resetForNewRound() {
        // Reset position tracking
        this.positionObjects = {};
        this.snapPositions.forEach(pos => pos.isOccupied = false);

        // Reset objects to original positions
        this.objects.forEach(obj => {
            obj.x = obj.originalX;
            obj.y = obj.originalY;
        });
    }

    onWinBubbleClose() {
        GameManager.saveGameResult(6, true, this.totalUsedSeconds);

        this.objects.forEach(obj => obj.setVisible(false));
        if (this.confirmBtn) this.confirmBtn.setVisible(false);
        this.nextDialog = this.add.image(this.centerX, this.cameras.main.height * 0.8, 'game6_npc_box_win_02').setDepth(1000);
        this.nextDialog.setInteractive({ useHandCursor: true });
        this.nextDialog.once('pointerdown', () => {
            this.nextDialog.destroy();
            this.showDescriptionPanel();
        });
    }


    showDescriptionPanel() {
        console.log('[DESCRIPTION] Showing success description panel');
        const descriptionPanel = new CustomPanel(this, 960, 540, [
            { content: 'game6_success_description1' },
            { content: 'game6_success_description2' }
        ]);

        descriptionPanel.setDepth(1000);
        descriptionPanel.show();
        descriptionPanel.setNextButtonPosition(100, 0);
        descriptionPanel.setCloseCallBack
            (() => {
                descriptionPanel.destroy();
                this.showObjectPanel();
            });
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game6_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => {
            GameManager.switchToGameScene(this, 'GameScene_7');
        });
    }


    drawDebug() {
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        this.debugGraphics.fillStyle(0xff0000, 0.2);
        this.snapPositions.forEach(pos => {
            this.debugGraphics.strokeCircle(pos.x, pos.y, 80); // Draw outer circle
            this.debugGraphics.fillCircle(pos.x, pos.y, 5); // Draw center point
        });
        this.debugGraphics.setDepth(999); // Just below borders

    }
}
