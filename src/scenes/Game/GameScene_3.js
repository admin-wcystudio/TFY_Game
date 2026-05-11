
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_3 extends BaseGameScene {
    constructor() {
        super('GameScene_3');
    }

    preload() {

        const path = 'assets/images/Game_3/';
        // NPC dialogue boxes (in ascending order)
        this.load.image('game3_npc_mainstreet_fail_01', `${path}game3_npc_box1.png`);
        this.load.image('game3_npc_mainstreet_fail_02', `${path}game3_npc_box2.png`);
        this.load.image('game3_npc_mainstreet', `${path}game3_npc_box3.png`);

        this.load.image('game3_npc_box_tryagain', `${path}game3_npc_box4.png`);
        this.load.image('game3_npc_box_win', `${path}game3_npc_box5.png`);

        // UI buttons
        this.load.image('confirm_button', `${path}game3_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game3_confirm_button_select.png`);

        for (let i = 1; i <= 5; i++) {
            this.load.image(`game3_q${i}`, `${path}game3_q${i}_box.png`);
            this.load.image(`game3_q${i}_description`, `${path}game3_q${i}_description.png`);
            this.load.image(`game3_q${i}_a_button`, `${path}game3_q${i}_a_button.png`);
            this.load.image(`game3_q${i}_b_button`, `${path}game3_q${i}_b_button.png`);
            this.load.image(`game3_q${i}_c_button`, `${path}game3_q${i}_c_button.png`);
            this.load.image(`game3_q${i}_d_button`, `${path}game3_q${i}_d_button.png`);
            this.load.image(`game3_q${i}_a_button_select`, `${path}game3_q${i}_a_button_select.png`);
            this.load.image(`game3_q${i}_b_button_select`, `${path}game3_q${i}_b_button_select.png`);
            this.load.image(`game3_q${i}_c_button_select`, `${path}game3_q${i}_c_button_select.png`);
            this.load.image(`game3_q${i}_d_button_select`, `${path}game3_q${i}_d_button_select.png`);
        }

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game3_q${i}_title`, `${path}game3_q${i}_title.png`);
        }
    }

    create() {
        // Pass null for bgKey since using video background
        this.initGame('game3_bg', 'game3_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 3
        });
    }

    setupGameObjects() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
            this.questionPanel = null;
        }

        const allQuestions = [
            {
                content: 'game3_q1',
                options: ['game3_q1_a_button', 'game3_q1_b_button', 'game3_q1_c_button', 'game3_q1_d_button'],
                answer: 2,
                detail: 'game3_q1_description'
            },
            {
                content: 'game3_q2',
                options: ['game3_q2_a_button', 'game3_q2_b_button', 'game3_q2_c_button', 'game3_q2_d_button'],
                answer: 0,
                detail: 'game3_q2_description'
            },
            {
                content: 'game3_q3',
                options: ['game3_q3_a_button', 'game3_q3_b_button', 'game3_q3_c_button', 'game3_q3_d_button'],
                answer: 2,
                detail: 'game3_q3_description'
            },
            {
                content: 'game3_q4',
                options: ['game3_q4_a_button', 'game3_q4_b_button', 'game3_q4_c_button', 'game3_q4_d_button'],
                answer: 1,
                detail: 'game3_q4_description'
            },
            {
                content: 'game3_q5',
                options: ['game3_q5_a_button', 'game3_q5_b_button', 'game3_q5_c_button', 'game3_q5_d_button'],
                answer: 2,
                detail: 'game3_q5_description'
            }
        ];

        // Shuffle all questions using Phaser's built-in shuffle
        Phaser.Utils.Array.Shuffle(allQuestions);

        // Select the first three questions after shuffling
        const selectedQuestions = allQuestions.slice(0, 3);

        this.questionPanel = new QuestionPanel(this, selectedQuestions, () => {
        });
        this.questionPanel.setDepth(559).setVisible(false);
    }

    enableGameInteraction(enable) {
        if (this.questionPanel) {
            this.questionPanel.setVisible(enable);
        }
    }

    resetForNewRound() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
        }

        this.setupGameObjects(); // 重新抽題並建立 Panel
        this.questionPanel.setVisible(true);
    }

    showWin() {
        this.questionPanel.setVisible(false);
        this.showObjectPanel();
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


    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds) || this.isAllowRoundFail;
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        if (isFinalWin) {
            this.gameTimer.stop();
            this._calculateTiming(true);
            this.enableGameInteraction(false);

            this.showFeedbackLabel(true);
            this.showBubble('win');
        }
        this.updateRoundUI(true);

    }
}
