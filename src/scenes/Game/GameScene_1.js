import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_1 extends BaseGameScene {
    constructor() {
        super('GameScene_1');
    }
    preload() {
        this.load.audio('bgm', 'assets/music/bgm.mp3');
        const path = 'assets/images/Game_1/';
        this.load.image('confirm_button', `${path}game1_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game1_confirm_button_select.png`);

        this.load.image('game1_npc_box_mainstreet_01', `${path}game1_npc_box1.png`);
        this.load.image('game1_npc_box_win', `${path}game1_npc_box2.png`);
        this.load.image('game1_npc_box_win_02', `${path}game1_npc_box3.png`);
        this.load.image('game1_npc_box_tryagain', `${path}game1_npc_box4.png`);


        for (let i = 1; i <= 6; i++) {
            this.load.image(`game1_arcadia_object${i}`, `${path}game1_arcadia_object${i}.png`);
            this.load.image(`game1_outsideworld_object${i}`, `${path}game1_outsideworld_object${i}.png`);
        }

        this.load.image('game1_border1', `${path}game1_border1.png`);
        this.load.image('game1_border2', `${path}game1_border2.png`);

    }

    create() {

        if (this.sound.getAll('bgm').length === 0) {
            this.sound.play('bgm', { loop: true, volume: 0.5 });
        }

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.isPlayedSound = false;

        this.initGame('game1_bg', 'game1_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: false,
            sceneIndex: 1
        });
        this.gameUI.itemBtn.setVisible(false);

        // Create confirm button
        this.confirmBtn = new CustomButton(this, this.centerX, this.height - 100,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });

        this.confirmBtn.setDepth(600).setVisible(true);
    }

    setupGameObjects() {
        this.border1 = this.add.image(this.centerX - 350, this.centerY + 50, 'game1_border1').setDepth(500).setVisible(true);
        this.border2 = this.add.image(this.centerX + 350, this.centerY + 50, 'game1_border2').setDepth(500).setVisible(true);

        // Track which object is at each position
        this.positionObjects = {};

        // Snap positions inside borders: indices 0-5 = border1 (2 cols x 3 rows), indices 6-11 = border2
        const b1x = this.centerX - 350;
        const b2x = this.centerX + 350;
        const by = this.centerY + 50;
        const colOffset = 130;
        const rowOffsets = [-120, 0, 120];

        this.snapPositions = [];
        for (const ry of rowOffsets) {
            this.snapPositions.push({ x: b1x - colOffset, y: by + ry, isOccupied: false, border: 1 });
            this.snapPositions.push({ x: b1x + colOffset, y: by + ry, isOccupied: false, border: 1 });
        }
        for (const ry of rowOffsets) {
            this.snapPositions.push({ x: b2x - colOffset, y: by + ry, isOccupied: false, border: 2 });
            this.snapPositions.push({ x: b2x + colOffset, y: by + ry, isOccupied: false, border: 2 });
        }

        this.snapRadius = 80; // Distance threshold for snapping

        // 12 spawn positions: 6 on the left side, 6 on the right side
        const spawnPositions = [
            // Left side (below border1) - 3 cols x 2 rows
            { x: this.centerX - 800, y: this.centerY - 220 },
            { x: this.centerX - 800, y: this.centerY - 100 },
            { x: this.centerX - 800, y: this.centerY + 20 },
            { x: this.centerX - 800, y: this.centerY + 140 },
            { x: this.centerX - 800, y: this.centerY + 260 },
            { x: this.centerX - 800, y: this.centerY + 380 },
            // Right side (below border2) - 3 cols x 2 rows
            { x: this.centerX + 800, y: this.centerY - 220 },
            { x: this.centerX + 800, y: this.centerY - 100 },
            { x: this.centerX + 800, y: this.centerY + 20 },
            { x: this.centerX + 800, y: this.centerY + 140 },
            { x: this.centerX + 800, y: this.centerY + 260 },
            { x: this.centerX + 800, y: this.centerY + 380 },
        ];



        // Shuffle all 12 spawn positions together
        const shuffled = Phaser.Utils.Array.Shuffle([...spawnPositions]);

        this.objects = [];
        for (let i = 1; i <= 6; i++) {
            const pos = shuffled[i - 1];
            const obj = this.add.image(pos.x, pos.y, `game1_arcadia_object${i}`)
                .setDepth(505)
                .setInteractive({ draggable: true })
                .setVisible(true);

            obj.objectId = i;
            obj.originalX = pos.x;
            obj.originalY = pos.y;

            this.objects.push(obj);
        }

        for (let i = 1; i <= 6; i++) {
            const pos = shuffled[i + 5];
            const obj = this.add.image(pos.x, pos.y, `game1_outsideworld_object${i}`)
                .setDepth(505)
                .setInteractive({ draggable: true })
                .setVisible(true);

            obj.objectId = i + 6;
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

        // Border 1: all arcadia objects (1-6), Border 2: all outsideworld objects (7-12)
        this.border1_correctObjects = [1, 2, 3, 4, 5, 6];
        this.border2_correctObjects = [7, 8, 9, 10, 11, 12];

        //this.drawDebug();
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
        const allPositions = Array.from({ length: 12 }, (_, i) => i);
        const allOccupied = allPositions.every(i => this.positionObjects.hasOwnProperty(i));

        if (allOccupied) {
            console.log('[CHECK] All positions occupied (all 3 borders)!');
            console.log('[CHECK] Current positions:', this.positionObjects);
            console.log('[CHECK] Click confirm button to check answer');
        }
    }

    enableGameInteraction(enable) {
        this.border1.setVisible(enable);
        this.border2.setVisible(enable);
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


        const border1Positions = [0, 1, 2, 3, 4, 5];
        const border1Objects = border1Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        const border2Positions = [6, 7, 8, 9, 10, 11];
        const border2Objects = border2Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);


        // Check if border 1 has all correct objects
        const border1Correct = this.border1_correctObjects.every(objId => border1Objects.includes(objId)) &&
            border1Objects.length === this.border1_correctObjects.length;

        // Check if border 2 has all correct objects
        const border2Correct = this.border2_correctObjects.every(objId => border2Objects.includes(objId)) &&
            border2Objects.length === this.border2_correctObjects.length;


        if (border1Correct && border2Correct) {
            console.log('[ANSWER] ✓ All objects correctly placed in all borders!');
            this.onRoundWin();


        } else {
            console.log('[ANSWER] ✗ Incorrect placement!');
            this.handleLose();
        }
    }

    handleLose() {
        // Prevent multiple entries
        if (this.gameState === 'gameLose') return;

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
        this.nextDialog = this.add.image(this.centerX, this.cameras.main.height * 0.8, 'game1_npc_box_win_02').setDepth(1000);
        this.nextDialog.setInteractive({ useHandCursor: true });
        this.nextDialog.once('pointerdown', () => {
            this.nextDialog.destroy();
            this.showObjectPanel();
        });
    }




    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game1_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => {
            //GameManager.backToMainStreet(this);
        });
    }


    drawDebug() {
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.setDepth(1000);

        this.snapPositions.forEach((pos, index) => {
            const color = pos.border === 1 ? 0x00ccff : 0xff6600;

            // Snap radius circle
            this.debugGraphics.lineStyle(2, color, 0.8);
            this.debugGraphics.strokeCircle(pos.x, pos.y, this.snapRadius);

            // Center dot
            this.debugGraphics.fillStyle(color, 1);
            this.debugGraphics.fillCircle(pos.x, pos.y, 5);

            // Index + border label
            this.add.text(pos.x, pos.y - this.snapRadius - 12,
                `#${index} B${pos.border}`,
                { fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }
            ).setOrigin(0.5, 1).setDepth(1001);
        });
    }
}
