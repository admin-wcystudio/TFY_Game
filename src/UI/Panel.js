import { CustomButton, CustomButton2 } from './Button.js';
/**
 * BASE PANEL CLASS
 * Provides common functionality for all game overlays
 */
class BasePanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, bgKey) {
        super(scene, x, y);
        this.scene = scene;
        this.toggleBtn = null;

        // 1. Fixed positioning for UI
        this.setScrollFactor(0);
        this.setDepth(1000); // High default depth

        // 2. Optional Dimmer Background (creates focus)
        this.dimmer = scene.add.rectangle(0, 0, scene.scale.width * 2, scene.scale.height * 2, 0x000000, 0.6);
        this.dimmer.setInteractive(); // Blocks clicks to layers below
        this.add(this.dimmer);
        this.sendToBack(this.dimmer);

        // 3. Main Background Image
        if (bgKey) {
            this.bg = scene.add.image(0, 0, bgKey);
            this.add(this.bg);
        }

        scene.add.existing(this);
        this.setVisible(false);
    }

    show() {
        this.setVisible(true);
        this.setAlpha(0);
        this.setScale(0.8);

        // Tween for "Juicy" feel
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    hide() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.8,
            duration: 150,
            onComplete: () => {
                this.setVisible(false);
                if (this.toggleBtn) this.toggleBtn.resetStatus();
                if (this.onClose) this.onClose();
            }
        });
    }
}

/**
 * ENHANCED PAGINATED PANEL
 * Used for Tutorials or Multi-page Info
 */
export class CustomPanel extends BasePanel {
    constructor(scene, x, y, pages = []) {
        const firstPageContent = (pages && pages.length > 0) ? pages[0].content : pages;
        super(scene, x, y, firstPageContent);
        this.pages = pages || [];
        this.currentPage = 0;
        this.customCloseCallback = null;

        // Re-use the background image as content holder
        this.contentImage = this.bg;

        // Standardized Buttons
        this.prevBtn = new CustomButton(scene, -570, 260, 'prev_button', 'prev_button_click', () => this.changePage(-1));
        this.nextBtn = new CustomButton(scene, 570, 260, 'next_button', 'next_button_click', () => this.changePage(1));
        this.closeBtn = new CustomButton(scene, 625, -295, 'close_button', 'close_button_click', () => this.handleClose());

        this.closeBtn.setScrollFactor(0);
        this.add([this.prevBtn, this.nextBtn, this.closeBtn]);
        this.refresh();
    }

    setCloseCallBack(callback) {
        this.customCloseCallback = callback;
    }

    handleClose() {
        this.hide();
        if (this.customCloseCallback) {
            this.customCloseCallback();
        }
    }

    setNextButtonPosition(x, y) {
        this.nextBtn.setPosition(570 + x, 260 + y);
    }

    changePage(dir) {
        this.currentPage = Phaser.Math.Clamp(this.currentPage + dir, 0, this.pages.length - 1);
        this.refresh();
    }

    refresh() {
        const data = this.pages[this.currentPage];
        if (!data) return;

        this.contentImage.setTexture(data.content);
        this.prevBtn.setVisible(this.currentPage > 0);
        this.nextBtn.setVisible(this.currentPage < this.pages.length - 1);
    }
}

/**
 * ENHANCED SETTINGS PANEL
 * Centralized data management
 */

export class SettingPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.toggleBtn = null;

        // 1. Load Data
        const savedData = localStorage.getItem('gameSettings');
        const settings = savedData ? JSON.parse(savedData) : { volume: 3, language: 'HK' };

        this.currentVolume = settings.volume;
        this.currentLanguage = settings.language;
        this.volumeCells = [];

        // 2. Build UI
        this.setupUI();

        // 3. Initial Sync
        this.updateVolumeDisplay();
        this.refreshLanguageUI();

        scene.add.existing(this);
        this.setVisible(false);
    }

    setupUI() {
        // Background
        this.bg = this.scene.add.image(0, 0, 'setting_bg').setScrollFactor(0);
        this.add(this.bg);

        // Volume Section
        this.volumeBg = this.scene.add.image(130, -100, 'vol_bg').setScrollFactor(0);
        this.add(this.volumeBg);

        const startX = -260;
        const cellGap = 130;
        for (let i = 1; i <= 5; i++) {
            let cell = this.scene.add.image(startX + (i * cellGap), -103, `vol_${i}`).setScrollFactor(0);
            this.add(cell);
            this.volumeCells.push(cell);
        }

        // Language Section
        this.mandarinBtn = new CustomButton2(this.scene, -50, 50, 'lang_mandarin', 'lang_mandarin_click', () => this.setLanguage('CN'));
        this.cantoneseBtn = new CustomButton2(this.scene, 300, 50, 'lang_cantonese', 'lang_cantonese_click', () => this.setLanguage('HK'));

        this.mandarinBtn.needClicked = true;
        this.cantoneseBtn.needClicked = true;
        this.add([this.mandarinBtn, this.cantoneseBtn]);

        // Controls
        this.prevBtn = new CustomButton(this.scene, -250, -100, 'vol_left', 'vol_left_click', () => this.setVolume(-1));
        this.nextBtn = new CustomButton(this.scene, 525, -100, 'vol_right', 'vol_right_click', () => this.setVolume(1));

        this.closeBtn = new CustomButton(this.scene, 625, -295, 'close_button', 'close_button_click', () => this.hide());
        this.saveBtn = new CustomButton(this.scene, -50, 200, 'save_btn', 'save_btn_click', () => this.saveToLocal());

        this.add([this.prevBtn, this.nextBtn, this.closeBtn, this.saveBtn]);

        // Ensure all UI elements ignore camera scroll
        this.list.forEach(item => item.setScrollFactor(0));
    }

    setVolume(dir) {
        // Use Clamp to keep volume between 1 and 5
        this.currentVolume = Phaser.Math.Clamp(this.currentVolume + dir, 1, 5);
        this.updateVolumeDisplay();

        // Immediate feedback: Update global sound volume
        this.scene.sound.volume = this.currentVolume * 0.2;
    }

    updateVolumeDisplay() {
        this.volumeCells.forEach((cell, index) => {
            cell.setVisible(index < this.currentVolume);
        });
    }

    setLanguage(lang) {
        if (this.currentLanguage === lang) return; // Skip if no change
        this.currentLanguage = lang;
        this.refreshLanguageUI();
    }

    refreshLanguageUI() {
        const isMandarin = this.currentLanguage === 'CN';

        // Sync Mandarin Button State
        this.mandarinBtn.isClicked = isMandarin;
        isMandarin ? this.mandarinBtn.setPressedState() : this.mandarinBtn.setNormalState();

        // Sync Cantonese Button State
        this.cantoneseBtn.isClicked = !isMandarin;
        !isMandarin ? this.cantoneseBtn.setPressedState() : this.cantoneseBtn.setNormalState();
    }

    saveToLocal() {
        const settings = {
            volume: this.currentVolume,
            language: this.currentLanguage
        };
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        this.hide();
    }

    show() {
        this.setVisible(true);
        this.refreshLanguageUI();
        this.updateVolumeDisplay();
    }

    hide() {
        this.setVisible(false);
        if (this.toggleBtn) this.toggleBtn.resetStatus();
    }
}
export class ItemsPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        const width = 1920; // 假設開發解析度
        const height = 1080;

        const itemsContent = [
            {
                itemKey: 'itempage_item1',
                itemSelectKey: 'itempage_item1_select',
                itemDescriptionKey: 'game1_object_description'
            },
            {
                itemKey: 'itempage_item2',
                itemSelectKey: 'itempage_item2_select',
                itemDescriptionKey: 'game2_object_description'
            },

            {
                itemKey: 'itempage_item3',
                itemSelectKey: 'itempage_item3_select',
                itemDescriptionKey: 'game3_object_description'
            },
            {
                itemKey: 'itempage_item4',
                itemSelectKey: 'itempage_item4_select',
                itemDescriptionKey: 'game4_object_description'
            },
            {
                itemKey: 'itempage_item5',
                itemSelectKey: 'itempage_item5_select',
                itemDescriptionKey: 'game6_object_description',
                gameId: 6
            }
        ];

        const ROW_SPACING = 250;
        const COLS = 5;
        const ROW1_Y = -100;
        const ROW2_Y = 200;
        const startX = -((COLS - 1) * ROW_SPACING) / 2; // -500

        // 1. 背景層
        this.bg = scene.add.image(0, 0, 'itempage_bg').setDepth(1).setScrollFactor(0);
        this.panelBg = scene.add.image(0, 0, 'itempage_panel_bg').setDepth(2).setScrollFactor(0);
        this.add([this.bg, this.panelBg]);

        // 2. Preset 10 item boxes (5 top + 5 bottom), store refs for texture swap
        const slots = [];
        for (let col = 0; col < COLS; col++) {
            const bx = startX + col * ROW_SPACING;
            const topBox = scene.add.image(bx, ROW1_Y, 'itempage_item_box').setDepth(3).setScrollFactor(0);
            const botBox = scene.add.image(bx, ROW2_Y, 'itempage_item_box').setDepth(3).setScrollFactor(0);
            this.add([topBox, botBox]);
            slots.push(topBox);  // slots 0-4  → row 1
            slots.push(botBox);  // slots 5-9  → row 2 (interleaved so slot index = col + row*5 below)
        }
        // Reorder: slots[0-4] = top row left→right, slots[5-9] = bottom row left→right
        const orderedSlots = [
            slots[0], slots[2], slots[4], slots[6], slots[8],  // top row
            slots[1], slots[3], slots[5], slots[7], slots[9]   // bottom row
        ];

        // Get game results from localStorage
        const savedGameResultData = localStorage.getItem('allGamesResult');
        const allResults = savedGameResultData ? JSON.parse(savedGameResultData) : [];

        // 3. For each item, if unlocked swap texture and add click handler
        itemsContent.forEach((item, index) => {
            const slot = orderedSlots[index];
            if (!slot) return;

            const gameId = item.gameId || index + 1;
            const isUnlocked = allResults.find(r => r.game === gameId)?.isFinished;
            if (!isUnlocked) return;

            // Swap placeholder texture to item image
            slot.setTexture(item.itemKey).setInteractive({ useHandCursor: true });

            slot.on('pointerover', () => slot.setTexture(item.itemSelectKey));
            slot.on('pointerout', () => slot.setTexture(item.itemKey));
            slot.on('pointerdown', () => {
                slot.setTexture(item.itemSelectKey);
                const pages = [
                    item.itemDescriptionKey,
                    item.itemDescriptionKey1,
                    item.itemDescriptionKey2
                ].filter(key => key != null).map(key => ({ content: key }));

                if (pages.length > 0) {
                    const blocker = scene.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.5).setInteractive().setScrollFactor(0);

                    const descPanel = new CustomPanel(scene, 0, 0, pages);
                    descPanel.setCloseCallBack(() => {
                        slot.setTexture(item.itemKey);
                        blocker.destroy();
                        this.activeDescPanel = null;
                        this.activeBlocker = null;
                    });

                    descPanel.setDepth(501).setScrollFactor(0).show();
                    blocker.setDepth(500).setScrollFactor(0);

                    this.add([blocker, descPanel]);
                    this.activeDescPanel = descPanel;
                    this.activeBlocker = blocker;
                }
            });
        });

        // 3. 關閉按鈕
        this.closeBtn = new CustomButton(scene, 620, -290, 'itempage_close_button', 'itempage_close_button_select', () => {
            if (this.activeDescPanel) {
                this.activeDescPanel.destroy();
                this.activeDescPanel = null;
            }
            if (this.activeBlocker) {
                this.activeBlocker.destroy();
                this.activeBlocker = null;
            }

            this.setVisible(false);
            if (this.toggleBtn) this.toggleBtn.resetStatus(); // 讓外部按鈕彈回
        }).setScrollFactor(0);
        this.add(this.closeBtn);

        this.setVisible(false);

        scene.add.existing(this);
    }
}

export class CustomFailPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, onRestart, onQuit) {
        super(scene, x, y);
        this.scene = scene;
        this.currentPage = 0;
        this.toggleBtn = null;

        this.contentImage = scene.add.image(0, 0, 'popup_bg').setDepth(200);
        this.add(this.contentImage);

        this.tryAgainBtn = new CustomButton(scene, 0, -100, 'again_btn', 'again_btn_click', () => {
            if (onRestart) onRestart();
        }).setDepth(201);
        this.quitBtn = new CustomButton(scene, 0, 100, 'leave_btn', 'leave_btn_click', () => {
            if (onQuit) onQuit();
        }).setDepth(201);

        this.add([this.tryAgainBtn, this.quitBtn]);

        // 重要：將呢個 Container 加落 Scene
        scene.add.existing(this);
    }

}

// game 3 
export class QuestionPanel extends Phaser.GameObjects.Container {
    constructor(scene, contents, onComplete) {
        super(scene, 960, 540);
        this.scene = scene;
        this.onComplete = onComplete;
        this.currentIndex = 0;
        this.selectedAnswerIndex = -1;

        // Store the questions array
        this.questions = contents;

        // Create image for displaying question content
        this.contentImage = scene.add.image(0, 50, '').setDepth(200).setVisible(false);
        this.add([this.contentImage]);

        // 2. 確認按鈕 (初始隱藏)
        this.confirmBtn = new CustomButton(scene, 0, 380,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });
        this.add(this.confirmBtn);

        this.optionButtons = [];
        this.showQuestion();
        scene.add.existing(this);
    }

    showQuestion() {
        const q = this.questions[this.currentIndex];
        this.contentImage.setTexture(q.content).setVisible(true);
        if (this.optionButtons) {
            this.optionButtons.forEach(btn => btn.destroy());
        }
        this.optionButtons = [];

        const options = q.options || q.option; // Support both 'options' and 'option'
        options.forEach((optKey, index) => {
            const x = 0;
            const y = -100 + index * 120;
            const btn = new CustomButton(this.scene, x, y, optKey, `${optKey}_select`,
                () => {
                    console.log(`${optKey}_select`);
                    this.selectedAnswer(btn, index);
                });
            btn.needClicked = true;

            this.add(btn); // 加入 Container
            this.optionButtons.push(btn); // 加入陣列追蹤
        });
    }
    selectedAnswer(gameObject, index) {
        // Reset all buttons to normal state
        this.optionButtons.forEach(btn => {
            btn.isClicked = false;
            btn.setNormalState();
            btn.clearTint();
        });

        console.log('Selected answer index:', index);
        // Lock selected button in pressed/highlighted state
        gameObject.isClicked = true;
        gameObject.setPressedState();
        this.selectedAnswerIndex = index;
    }

    showDialogList() {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height * 0.8;
        this.dialogVideo = this.scene.add.video(centerX, 540, 'game6_talk_video').setDepth(800).
            setVisible(true).setScrollFactor(0);
        this.dialogVideo.play(true);

        const q = this.questions[this.currentIndex];
        if (q.dialoges && q.dialoges.length > 0) {
            const dialogKeys = q.dialoges;
            console.log('Dialog keys:', dialogKeys);
            let dialogIndex = 0;

            const dialogImage = this.scene.add.image(centerX, centerY, dialogKeys[dialogIndex])
                .setDepth(801).setInteractive({ useHandCursor: true }).setVisible(true);

            const advance = () => {
                dialogIndex++;
                if (dialogIndex < dialogKeys.length) {
                    dialogImage.setTexture(dialogKeys[dialogIndex]);
                } else {
                    dialogImage.destroy();
                    this.nextQuestion();
                }
            };

            dialogImage.on('pointerdown', advance);
        } else {
            this.nextQuestion();
        }
    }


    checkAnswer() {
        const q = this.questions[this.currentIndex];
        const centerX = this.scene.cameras.main.width / 2;

        console.log(`Selected: ${this.selectedAnswerIndex}, Correct: ${q.answer}`);
        if (this.selectedAnswerIndex === q.answer) {
            // Stop timer and hide panel while showing dialog
            if (this.scene.gameTimer) this.scene.gameTimer.stop();
            this.setVisible(false);
            this.showDialogList();
        } else {
            console.log("答錯了 , correct : " + q.answer);
            this.scene.updateRoundUI(false);
            this.setVisible(false);
            if (!this.dialogVideo) {
                const centerX = this.scene.cameras.main.width / 2;
                this.dialogVideo = this.scene.add.video(centerX, 540, 'game6_talk_video')
                    .setDepth(800).setScrollFactor(0);
                this.dialogVideo.play(true);
            }
            this.dialogVideo.setVisible(true);
            this.scene.handleLose();

        }
    }

    destroy() {
        if (this.dialogVideo) {
            this.dialogVideo.destroy();
            this.dialogVideo = null;
        }
        super.destroy();
    }

    nextQuestion() {
        this.scene.onRoundWin();
        this.scene.roundIndex++;
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            if (this.dialogVideo) this.dialogVideo.setVisible(false);
            this.setVisible(true);
            this.confirmBtn.setVisible(true);
            this.selectedAnswerIndex = -1;
            if (this.scene.gameTimer) this.scene.gameTimer.start();
            this.showQuestion();
        } else {
            this.scene.onRoundWin();
            this.dialogVideo.setVisible(true);
            console.log('All questions answered correctly!');
            this.destroy();
        }
    }
}


export class QuestionPanel_7 extends Phaser.GameObjects.Container {
    constructor(scene, contents, onComplete) {
        super(scene, 960, 540);
        this.scene = scene;
        this.onComplete = onComplete;
        this.currentIndex = 0;
        this.selectedAnswerIndex = -1;

        // Store the questions array
        this.questions = contents;

        // Create image for displaying question content
        this.contentImage = scene.add.image(0, 50, '').setDepth(200).setVisible(false);
        this.add([this.contentImage]);

        // 2. 確認按鈕 (初始隱藏)
        this.confirmBtn = new CustomButton(scene, 0, 380,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });
        this.add(this.confirmBtn);

        this.optionButtons = [];
        this.showQuestion();
        scene.add.existing(this);
    }

    showQuestion() {
        const q = this.questions[this.currentIndex];
        this.contentImage.setTexture(q.content).setVisible(true);
        if (this.optionButtons) {
            this.optionButtons.forEach(btn => btn.destroy());
        }
        this.optionButtons = [];

        const options = q.options || q.option; // Support both 'options' and 'option'
        options.forEach((optKey, index) => {
            const y = -50 + index * 120;
            const btn = new CustomButton(this.scene, 0, y, optKey, `${optKey}_select`,
                () => {
                    this.selectedAnswer(btn, index);
                });
            btn.needClicked = true;

            this.add(btn); // 加入 Container
            this.optionButtons.push(btn); // 加入陣列追蹤
        });
    }

    handleSelect(index) {
        // Deprecated: use selectedAnswer instead
        this.selectedAnswer(this.optionButtons[index], index);
    }
    selectedAnswer(gameObject, index) {
        // Reset all buttons to normal state
        this.optionButtons.forEach(btn => {
            btn.isClicked = false;
            btn.setNormalState();
            btn.clearTint();
        });
        // Lock selected button in pressed/highlighted state
        gameObject.isClicked = true;
        gameObject.setPressedState();
        this.selectedAnswerIndex = index;
    }

    checkAnswer() {
        const q = this.questions[this.currentIndex];

        console.log(`Selected: ${this.selectedAnswerIndex}, Correct: ${q.answer}`);
        if (this.selectedAnswerIndex === q.answer) {
            if (this.scene.updateRoundUI) {
                this.scene.updateRoundUI(true);
                this.scene.roundIndex++;
                this.nextQuestion();
            }
        } else {
            console.log("答錯了 , correct : " + q.answer);
            this.setVisible(false);
            this.scene.handleLose();
        }
    }

    nextQuestion() {
        this.scene.onRoundWin();
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.confirmBtn.setVisible(true);
            this.selectedAnswerIndex = -1;
            this.showQuestion();
        } else {
            console.log('All questions answered correctly!');
            this.destroy(); // 3 題都答完了

        }

    }
}
