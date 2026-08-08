import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_5 extends BaseGameScene {
    constructor() {
        super('GameScene_5');
    }
    preload() {
        const path = 'assets/images/Game_5/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game5_npc_box_mainstreet', `${path}game5_npc_box3.png`);
        this.load.image('game5_npc_box_win', `${path}game5_npc_box4.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box5.png`);
        this.load.image('game5_rotate', `${path}game5_rotate.png`);
        this.load.image('game5_object_description', `${path}game5_object_description.png`);

        this.load.image('game5_puzzle_guide', `${path}game5_puzzle_guide.png`);

        for (let i = 1; i <= 6; i++) {
            this.load.image(`game5_puzzle${i}`, `${path}game5_puzzle${i}.png`);
        }

        this.gender = 'F';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }
        this.load.image('game5_finish_preview', `${path}game5_finish_preview.png`);

    }

    create() {
        this.initGame('game5_bg', 'game5_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });

    }
    setupGameObjects() {
        this.selectedPuzzle = null;

        if (this.guide) this.guide.destroy();
        if (this.rotateButton) this.rotateButton.destroy();
        this.input.removeAllListeners('drag');
        this.input.removeAllListeners('dragend');

        const centerX = this.cameras.main.width / 2;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Guide is 597x398 → 3 columns × 2 rows (piece size ~196)
        const guideX = centerX;
        const guideY = 500;
        const cellW = 199;
        const cellH = 199;

        const defaultPuzzles = [
            { content: 'game5_puzzle1', targetX: guideX - cellW, targetY: guideY - cellH / 2 },
            { content: 'game5_puzzle2', targetX: guideX, targetY: guideY - cellH / 2 },
            { content: 'game5_puzzle3', targetX: guideX + cellW, targetY: guideY - cellH / 2 },
            { content: 'game5_puzzle4', targetX: guideX - cellW, targetY: guideY + cellH / 2 },
            { content: 'game5_puzzle5', targetX: guideX, targetY: guideY + cellH / 2 },
            { content: 'game5_puzzle6', targetX: guideX + cellW, targetY: guideY + cellH / 2 }
        ];

        this.puzzleGroup = this.add.group();

        this.guide = this.add.image(guideX, guideY, 'game5_puzzle_guide').setDepth(10);

        defaultPuzzles.forEach(data => {
            let piece = this.add.image(0, 0, data.content).setDepth(50);
            piece.setData({ targetX: data.targetX, targetY: data.targetY, isCorrect: false });
            piece.on('pointerdown', () => this.selectPuzzle(piece));
            this.puzzleGroup.add(piece);
        });

        this.randomPuzzlePosition(this.puzzleGroup.getChildren());

        // 旋轉按鈕
        this.rotateButton = new CustomButton(this, width - 200, height - 200, 'game5_rotate', null, () => {
            if (this.selectedPuzzle) this.selectedPuzzle.angle += 90;
        }).setDepth(100);

        // 拖拽事件 (搬移到這裡確保只設定一次)
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.selectedPuzzle !== gameObject) this.selectPuzzle(gameObject);
            gameObject.setPosition(dragX, dragY).setDepth(100);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(50);
            this.checkSnap(gameObject);
        });


        //==== Debug Graphics ===========================================================
        // const debugGraphics = this.add.graphics().setDepth(2); // 擺喺背景上面，物件下面
        // debugGraphics.lineStyle(3, 0xff0000, 1); // 紅色線，粗度 2

        // defaultPuzzles.forEach(data => {
        //     const rectSize = 200;
        //     const startX = data.targetX - rectSize / 2;
        //     const startY = data.targetY - rectSize / 2;

        //     // 畫出目標區域矩形
        //     debugGraphics.strokeRect(startX, startY, rectSize, rectSize);

        //     // 喺方框旁邊寫低係邊塊 Puzzle，方便對號入座
        //     this.add.text(startX, startY - 20, data.content, {
        //         fontSize: '16px',
        //         fill: '#ff0000'
        //     }).setDepth(1);
        // });

        // const tolerance = 60; // 同你 checkSnap 裡面個數值一樣
        // defaultPuzzles.forEach(data => {
        //     debugGraphics.lineStyle(1, 0x00ff00, 0.5); // 綠色虛線感
        //     debugGraphics.strokeCircle(data.targetX, data.targetY, tolerance);
        // });
    }
    /**
     * 控制拼圖是否可被操作
     */
    enableGameInteraction(enabled) {
        this.puzzleGroup.getChildren().forEach(p => {
            if (enabled) {
                p.setInteractive({ draggable: true, useHandCursor: true });
            } else {
                p.disableInteractive();
            }
        });
        this.guide.setVisible(enabled);
    }


    // --- 拼圖專用邏輯 (保持不變) ---

    selectPuzzle(piece) {
        if (this.selectedPuzzle) {
            this.selectedPuzzle.clearTint();
        }
        this.selectedPuzzle = piece;
        piece.setTint(0xaaaaaa);
    }

    checkSnap(piece) {
        const { targetX, targetY } = piece.data.values;
        const dist = Phaser.Math.Distance.Between(piece.x, piece.y, targetX, targetY);
        const isAngleCorrect = (piece.angle % 360 === 0);

        if (dist < 60 && isAngleCorrect) {
            piece.setPosition(targetX, targetY).setData('isCorrect', true).disableInteractive().clearTint();
            this.checkAllDone();
        }
    }

    randomPuzzlePosition(puzzles) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const allowedRotations = [0, 90, 180, 270];

        // Scatter pieces to left / right sides so they don't cover the 3x2 guide
        const sideSlots = [
            { x: 280, y: 280 },
            { x: 280, y: 520 },
            { x: 420, y: 720 },
            { x: width - 280, y: 280 },
            { x: width - 220, y: 500 },
            { x: width - 320, y: 720 }
        ];

        Phaser.Utils.Array.Shuffle(sideSlots);

        puzzles.forEach((puzzle, index) => {
            const slot = sideSlots[index % sideSlots.length];
            puzzle.setPosition(
                slot.x + Phaser.Math.Between(-30, 30),
                slot.y + Phaser.Math.Between(-30, 30)
            );
            puzzle.setAngle(Phaser.Utils.Array.GetRandom(allowedRotations));
            puzzle.setData('isCorrect', false);
            puzzle.setDepth(50);
            puzzle.clearTint();
        });
    }

    checkAllDone() {
        const allCorrect = this.puzzleGroup.getChildren().every(p => p.getData('isCorrect'));
        if (allCorrect) {
            console.log("所有拼圖完成!");
            this.onRoundWin();
        }
    }

    onWinBubbleClose() {
        this.enableGameInteraction(false);
        super.onWinBubbleClose();
        const finishPreview = this.add.image(this.centerX, this.centerY, 'game5_finish_preview')
            .setDepth(1000).setInteractive({ useHandCursor: true }).setScale(1.2);
        finishPreview.on('pointerdown', () => {
            finishPreview.destroy();

            this.time.delayedCall(
                1000, () => {
                    this.showObjectPanel();
                });
        });
    }


    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game5_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.switchScene(this, 'GameScene_6'));
    }


    /**
     * 重置每一局的拼圖狀態
     */
    resetForNewRound() {
        this.puzzleGroup.setVisible(true);
        this.puzzleGroup.getChildren().forEach(p => p.setData('isCorrect', false));
        this.randomPuzzlePosition(this.puzzleGroup.getChildren());
    }



}