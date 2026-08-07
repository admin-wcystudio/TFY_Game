import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_7 extends BaseGameScene {
    constructor() {
        super('GameScene_7');
    }

    preload() {
        const path = 'assets/images/Game_7/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image(`game7_fill_bg`, `${path}game7_fill_bg.png`);

        this.load.image('game7_npc_box_mainstreet_01', `${path}game7_npc_box1.png`);
        this.load.image('game7_npc_box_mainstreet_02', `${path}game7_npc_box2.png`);
        this.load.image('game7_npc_box_mainstreet_ok', `${path}game7_npc_box3.png`);
        this.load.image('game7_npc_box_mainstreet_ok_02', `${path}game7_npc_box4.png`);

        this.load.image('game7_npc_box_win', `${path}game7_npc_box5.png`);
        this.load.image('game7_npc_box_win_01', `${path}game7_npc_box6.png`);
        this.load.image('game7_npc_box_tryagain', `${path}game7_npc_box7.png`);

        this.load.image('game7_confirm_button', `${path}game7_confirm_button.png`);
        this.load.image('game7_confirm_button_select', `${path}game7_confirm_button_select.png`);

        for (let i = 1; i <= 5; i++) {
            this.load.image(`game7_fill${i}`, `${path}game7_fill${i}.png`);
            this.load.image(`game7_fill${i}a_popup`, `${path}game7_fill${i}a_popup.png`);
            this.load.image(`game7_fill${i}b_popup`, `${path}game7_fill${i}b_popup.png`);
        }

    }

    create() {
        this.initGame('game7_bg', 'game7_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 6
        });

    }

    setupGameObjects() {

        this.isChecked = false;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.cardBg = this.add.image(centerX, centerY, 'game7_fill_bg').setDepth(5);
        this.spawnCardPositions = [
            { x: centerX - 560, y: centerY - 200, },
            { x: centerX - 730, y: centerY + 80, },
            { x: centerX - 650, y: centerY + 350, },
            { x: centerX + 600, y: centerY - 150, },
            { x: centerX + 700, y: centerY + 150, }
        ];

        this.defaultCards = [
            { id: 1, content: 'game7_fill1', targetX: centerX - 225, targetY: centerY - 160, occupiedBy: null },
            { id: 2, content: 'game7_fill2', targetX: centerX + 200, targetY: centerY - 160, occupiedBy: null },
            { id: 3, content: 'game7_fill3', targetX: centerX - 420, targetY: centerY + 170, occupiedBy: null },
            { id: 4, content: 'game7_fill4', targetX: centerX, targetY: centerY + 170, occupiedBy: null },
            { id: 5, content: 'game7_fill5', targetX: centerX + 410, targetY: centerY + 170, occupiedBy: null }
        ];


        this.cardGroup = this.add.group();

        // Shuffle spawn positions for initial spawn
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);
        this.defaultCards.forEach((cardInfo, i) => {
            const spawnPos = shuffledPositions[i % shuffledPositions.length];
            const card = this.add.image(spawnPos.x, spawnPos.y, cardInfo.content);
            card.setData({ targetX: cardInfo.targetX, targetY: cardInfo.targetY, isCorrect: false });
            card.on('pointerdown', () => {
                this.selectCard(card);
            });
            this.cardGroup.add(card);
            card.setDepth(10);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.selectedCard !== gameObject) this.selectCard(gameObject);
            gameObject.setPosition(dragX, dragY).setDepth(100);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(50);
            // Log the texture key (name) of the gameObject
            this.checkSnap(gameObject);
        });

        this.confirm_button = new CustomButton(this, centerX + 800, centerY + 400,
            'game7_confirm_button', 'game7_confirm_button_select',
            () => {
                console.log(' button clicked');
                if (this.isChecked) return;
                this.isChecked = true;
                this.checkAllDone();
            }, () => { }).setScale(0.8);
        this.confirm_button.setActive(false);

        this.confirm_button.setDepth(100);

        // const debugGraphics = this.add.graphics().setDepth(this.depth + 2); // 擺喺背景上面，物件下面
        // debugGraphics.lineStyle(4, 0xff0000, 1); // 紅色線，粗度 2

        // const tolerance = 60; // 同你 checkSnap 裡面個數值一樣
        // this.defaultCards.forEach(data => {
        //     debugGraphics.lineStyle(3, 0x00ff00, 0.5); // 綠色虛線感
        //     debugGraphics.strokeCircle(data.targetX, data.targetY, tolerance);
        // });

    }

    selectCard(card) {
        if (this.selectedCard) {
            this.selectedCard.clearTint();
        }
        this.selectedCard = card;
        this.selectedCard.setTint(0xaaaaaa);

    }

    showObjectDescription(objectKey) {
        const descriptionKey = `${objectKey}a_popup`;
        const descriptionKeyB = `${objectKey}b_popup`;

        const pauseDescriptionPanel = () => {
            if (this.gameTimer) {
                this.gameTimer.stop();
            }
            this.cardGroup.getChildren().forEach(card => card.disableInteractive());
            if (this.confirm_button) {
                this.confirm_button.setActive(false);
            }
        };

        const resumeDescriptionPanel = () => {
            if (this.gameTimer) {
                this.gameTimer.start();
            }
            this.cardGroup.getChildren().forEach(card => card.setInteractive({ draggable: true }));
            if (this.confirm_button) {
                this.confirm_button.setActive(true);
            }
        };

        const descriptionPanel = new CustomPanel(this, 960, 540, [
            { content: descriptionKey },
            { content: descriptionKeyB }
        ]);

        descriptionPanel.setDepth(1000);
        descriptionPanel.setCloseCallBack(() => {
            descriptionPanel.destroy();
            resumeDescriptionPanel();
        });

        pauseDescriptionPanel();
        descriptionPanel.show();
    }

    enableGameInteraction(enable) {
        this.cardGroup.getChildren().forEach(card => {
            if (enable) {
                card.setVisible(true);
                card.setInteractive({ draggable: true });
            } else {
                card.disableInteractive();
                card.setVisible(false);
            }
        });
        this.confirm_button.setActive(enable);
        this.cardBg.setVisible(enable);
        if (enable) {
            this.isChecked = false;
        }
    }

    checkSnap(card) {
        // Find the nearest unoccupied card position within threshold
        const threshold = 60;
        let nearest = null;
        let minDist = Infinity;
        this.defaultCards.forEach(pos => {
            if (!pos.occupiedBy) {
                const d = Phaser.Math.Distance.Between(card.x, card.y, pos.targetX, pos.targetY);
                if (d < threshold && d < minDist) {
                    minDist = d;
                    nearest = pos;
                }
            } else {
                if (pos.occupiedBy === card) {
                    pos.occupiedBy = null;
                    card.clearTint();
                }
            }
            //console.log('Target Position -', pos.id, ',current card', pos.occupiedBy ? pos.occupiedBy.texture.key : 'none');
        });

        // Snap to nearest slot and show description
        if (nearest) {
            card.setPosition(nearest.targetX, nearest.targetY);
            nearest.occupiedBy = card;
            card.clearTint();
            this.showObjectDescription(card.texture.key);
        }
    }

    randomCardPosition(cards) {
        // Shuffle spawn positions
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);
        cards.forEach((card, i) => {
            const pos = shuffledPositions[i % shuffledPositions.length];
            card.setPosition(pos.x, pos.y);
        });
    }

    checkAllDone() {
        console.log('Checking all cards...');
        let allCorrect = true;

        this.defaultCards.forEach(cardInfo => {
            if (cardInfo.occupiedBy) {
                const placedKey = cardInfo.occupiedBy.texture.key;
                const targetKey = cardInfo.content;

                if (targetKey === placedKey) {
                    cardInfo.occupiedBy.setData('isCorrect', true);
                } else {
                    cardInfo.occupiedBy.setData('isCorrect', false);
                    allCorrect = false;
                }
            } else {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            this.onRoundWin();
        } else {
            this.handleLose();
        }

    }

    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        console.log(`Round ${this.roundIndex} win`);
        let isFinalWin = (this.roundIndex + 1 == this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.gameTimer.stop();
        this._calculateTiming(isFinalWin);
        this.enableGameInteraction(false);

        if (isFinalWin) {
            this.showFeedbackLabel(true);
            this.showBubble('win');
        } else {

            this.roundIndex++;
            this.resetForNewRound();
        }

        this.updateRoundUI(true);


    }
    showWin() {

        const centerX = this.cameras.main.width / 2;
        // Adaptive Y: 20% from bottom for win/tryagain, 80% for intro
        const centerY = this.cameras.main.height * 0.8;
        this.npcBox = this.add.image(centerX, centerY, 'game7_npc_box_win_01')
            .setDepth(1000).setInteractive({ useHandCursor: true });

        this.npcBox.once('pointerdown', () => {
            this.npcBox.destroy();
            this.npcBox = null;
            GameManager.backToMainStreet(this);
        });
    }


    resetForNewRound() {
        if (this.video) this.video.destroy();
        if (this.label) { this.label.destroy(); this.label = null; }

        this.randomCardPosition(this.cardGroup.getChildren());
        this.cardGroup.getChildren().forEach(card => {
            card.setData('isCorrect', false);
        });
        this.defaultCards.forEach(pos => {
            pos.occupiedBy = null;
        });
        this.cardGroup.setVisible(true);
        this.cardBg.setVisible(true);
        this.confirm_button.setVisible(true);

        this.gameState = 'playing';
        this.isGameActive = true;
        this.isChecked = false;

        this.enableGameInteraction(true);
    }


}