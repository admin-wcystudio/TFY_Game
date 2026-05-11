
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_5 extends BaseGameScene {
    constructor() {
        super('GameScene_5');
    }

    preload() {

        const path = 'assets/images/Game_5/';


        this.gender = 'F';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }

        this.load.image('game5_npc_box_mainstreet_fail_01', `${path}game5_npc_box1.png`);
        this.load.image('game5_npc_box_mainstreet_fail_02', `${path}game5_npc_box1.png`);

        if (this.gender === 'M') {
            this.load.image('game5_npc_box_mainstreet_01', `${path}game5_npc_box3_boy.png`);
            this.load.image('game5_npc_box_mainstreet_02', `${path}game5_npc_box4_boy.png`);
        } else {
            this.load.image('game5_npc_box_mainstreet_01', `${path}game5_npc_box3_girl.png`);
            this.load.image('game5_npc_box_mainstreet_02', `${path}game5_npc_box4_girl.png`);
        }

        this.load.image('game5_npc_box_mainstreet_03', `${path}game5_npc_box5.png`);
        this.load.image('game5_npc_box_mainstreet_04', `${path}game5_npc_box6.png`);


        this.load.image('game5_npc_box_win', `${path}game5_npc_box7.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box8.png`);

        //normal version
        this.load.image('game5_success_preview', `${path}game5_success_preview.png`);

        for (let i = 1; i <= 2; i++) {
            this.load.image(`game5_card${i}a`, `${path}game5_card${i}a.png`);
            this.load.image(`game5_card${i}b`, `${path}game5_card${i}b.png`);
            this.load.image(`game5_card${i}c`, `${path}game5_card${i}c.png`);
            this.load.image(`game5_card${i}d`, `${path}game5_card${i}d.png`);
            this.load.image(`game5_card${i}e`, `${path}game5_card${i}e.png`);
        }

        this.load.image(`game5_card`, `${path}game5_card.png`);
        this.load.image(`game5_card_select`, `${path}game5_card_select.png`);

    }
    create() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2 + 100;

        const centerX = this.centerX;
        const centerY = this.centerY;

        this.isNormalMode = true;
        this.isChecked = false;

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        // 5 pairs = 10 cards (2 rows of 5)
        this.spawnPos = [
            { x: centerX - 500, y: centerY - 200 },
            { x: centerX - 250, y: centerY - 200 },
            { x: centerX, y: centerY - 200 },
            { x: centerX + 250, y: centerY - 200 },
            { x: centerX + 500, y: centerY - 200 },
            { x: centerX - 500, y: centerY + 100 },
            { x: centerX - 250, y: centerY + 100 },
            { x: centerX, y: centerY + 100 },
            { x: centerX + 250, y: centerY + 100 },
            { x: centerX + 500, y: centerY + 100 }
        ];
        this.card = [];


        // Now call initGame which will call setupGameObjects
        this.initGame('game5_bg', 'game5_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });


    }

    setupGameObjects() {

        const cardBackKey = 'game5_card';
        const cardBackSelectedKey = 'game5_card_select';

        const cardTypes = [
            'game5_card1a', 'game5_card2a', 'game5_card2d', 'game5_card1c', 'game5_card2e',
            'game5_card2c', 'game5_card1d', 'game5_card1b', 'game5_card2b', 'game5_card1e'
        ];
        const positions = this.spawnPos;

        this.totalPairs = 5;

        // Create cards at fixed positions
        if (!cardTypes || !positions) return;

        cardTypes.forEach((cardType, index) => {
            const pos = positions[index];

            // Create card container
            const card = this.add.container(pos.x, pos.y).setDepth(500);

            // Card back (initially visible)
            const cardBack = this.add.image(0, 0, cardBackKey)
                .setInteractive({ useHandCursor: true })
                .setVisible(true)
                .setScale(1);

            // Card front (hidden initially) - scale to match card back size
            const cardFront = this.add.image(0, 0, cardType)
                .setVisible(false)
                .setScale(0.65);

            card.add([cardBack, cardFront]);

            // Store card data
            card.cardType = cardType;
            card.cardBack = cardBack;
            card.cardFront = cardFront;
            card.isFlipped = false;
            card.isMatched = false;

            cardBack.on('pointerover', () => {
                cardBack.setScale(1.05);
                cardBack.setTexture(cardBackSelectedKey);
            });

            cardBack.on('pointerout', () => {
                cardBack.setScale(1);
                cardBack.setTexture(cardBackKey);
            });

            // Add click handler
            cardBack.on('pointerdown', () => {
                this.onCardClick(card);
                cardBack.setTexture(cardBackSelectedKey);
            });

            this.cards.push(card);
        });

        console.log(`Created ${this.cards.length} cards`);
    }

    onCardClick(card) {
        if (!this.isGameActive || this.isChecking || card.isFlipped || card.isMatched) {
            return;
        }

        // Flip the card
        this.flipCard(card, true);
        this.flippedCards.push(card);

        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.isChecking = true;
            this.checkMatch();
        }
    }

    flipCard(card, faceUp) {
        card.isFlipped = faceUp;
        card.cardBack.setVisible(!faceUp);
        card.cardFront.setVisible(faceUp);

        // Optional: Add flip animation
        this.tweens.add({
            targets: card,
            scaleX: faceUp ? 0.8 : 1,
            scaleY: faceUp ? 0.8 : 1,
            duration: 150,
            ease: 'Linear'
        });
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        // Extract pair identifier (e.g., "game5_card1a" and "game5_card2a" both end with "a")
        const type1 = card1.cardType.slice(-1);
        const type2 = card2.cardType.slice(-1);

        if (type1 === type2) {
            // Match found!
            this.time.delayedCall(500, () => {
                card1.isMatched = true;
                card2.isMatched = true;

                // Make cards disappear with animation
                this.tweens.add({
                    targets: [card1, card2],
                    alpha: 0,
                    scale: 0.5,
                    duration: 300,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        card1.destroy();
                        card2.destroy();
                    }
                });

                // Increment matched pairs count
                this.matchedPairs++;
                console.log(`Matched pairs: ${this.matchedPairs}/${this.totalPairs}`);

                // Check if all pairs matched - WIN!
                if (this.matchedPairs === this.totalPairs) {
                    console.log('All pairs matched! You win!');
                    this.time.delayedCall(500, () => {
                        this.onRoundWin();
                    });
                }

                this.flippedCards = [];
                this.isChecking = false;
            });
        } else {
            // No match, flip back
            this.time.delayedCall(1000, () => {
                this.flipCard(card1, false);
                this.flipCard(card2, false);
                this.flippedCards = [];
                this.isChecking = false;
            });
        }
    }



    enableGameInteraction(enabled) {
        this.cards.forEach(card => {
            // Skip if card is destroyed or matched
            if (!card || card.isMatched || !card.cardBack) return;

            if (enabled) {
                card.cardBack.setInteractive();
            } else {
                card.cardBack.disableInteractive();
            }
        });
    }

    resetForNewRound() {
        // Destroy existing cards
        if (this.cards) {
            this.cards.forEach(card => card.destroy());
        }

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isChecking = false;

        // Recreate cards
        this.setupGameObjects();
    }

    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds) || this.isAllowRoundFail;
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.gameTimer.stop();
        this._calculateTiming(isFinalWin);
        this.enableGameInteraction(false);
        this.updateRoundUI(true);
        this.showFeedbackLabel(true);

        console.log(`Game won!`);

        this.winPreview = this.add.image(960, 540, 'game5_success_preview')
            .setDepth(600).setScale(1.3);

        this.winPreview.setInteractive({ useHandCursor: true }).setScale(1.3)
            .on('pointerdown', () => {
                this.winPreview.destroy();
                this.showBubble('win');
            });
    }



    showFailPanel() {
        const popupPanel = new CustomFailPanel(this, 960, 540, () => {
            popupPanel.destroy();
            this.restartGame();

            this.gameUI.descriptionPanel?.setCloseCallBack(() => this.startGame());
        }, () => {
            GameManager.backToMainStreet(this);
        });
        popupPanel.setDepth(1000);
    }
}
