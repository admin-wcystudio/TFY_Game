
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel, QuestionPanel_2 } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_2 extends BaseGameScene {
    constructor() {
        super('GameScene_2');
    }

    preload() {

        const path = 'assets/images/Game_2/';

        this.load.image('game2_npc_box_mainstreet', `${path}game2_npc_box1.png`);
        this.load.image('game2_npc_box_win', `${path}game2_npc_box3.png`);
        this.load.image('game2_npc_box_tryagain', `${path}game2_npc_box2.png`);
        // UI buttons
        this.load.image('game2_confirm_button', `${path}game2_confirm_button.png`);
        this.load.image('game2_confirm_button_select', `${path}game2_confirm_button_select.png`);


        for (let i = 1; i <= 5; i++) {
            this.load.image(`game2_q${i}`, `${path}game2_q${i}.png`);
            this.load.image(`game2_q${i}_description`, `${path}game2_q${i}_description.png`);
            this.load.image(`game2_q${i}_a_button`, `${path}game2_q${i}_a_button.png`);
            this.load.image(`game2_q${i}_b_button`, `${path}game2_q${i}_b_button.png`);
            this.load.image(`game2_q${i}_c_button`, `${path}game2_q${i}_c_button.png`);
            this.load.image(`game2_q${i}_d_button`, `${path}game2_q${i}_d_button.png`);

            this.load.image(`game2_q${i}_a_button_select`, `${path}game2_q${i}_a_button_select.png`);
            this.load.image(`game2_q${i}_b_button_select`, `${path}game2_q${i}_b_button_select.png`);
            this.load.image(`game2_q${i}_c_button_select`, `${path}game2_q${i}_c_button_select.png`);
            this.load.image(`game2_q${i}_d_button_select`, `${path}game2_q${i}_d_button_select.png`);
        }

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game2_q${i}_title`, `${path}game2_q${i}_title.png`);
        }
        this.load.image('game2_object_description', `${path}game2_object_description.png`);
    }

    create() {

        // Pass null for bgKey since using video background
        this.initGame('game2_bg', 'game2_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 30,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 2
        });
    }

    setupGameObjects() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
            this.questionPanel = null;
        }

        const allQuestions = [
            {
                question: 'game2_q1',
                description: 'game2_q1_description',
                options: ['game2_q1_a_button', 'game2_q1_b_button', 'game2_q1_c_button', 'game2_q1_d_button'],
                answer: 2,

            },
            {
                question: 'game2_q2',
                description: 'game2_q2_description',
                options: ['game2_q2_a_button', 'game2_q2_b_button', 'game2_q2_c_button', 'game2_q2_d_button'],
                answer: 1,

            },
            {
                question: 'game2_q3',
                description: 'game2_q3_description',
                options: ['game2_q3_a_button', 'game2_q3_b_button', 'game2_q3_c_button', 'game2_q3_d_button'],
                answer: 1,

            }, {
                question: 'game2_q4',
                description: 'game2_q4_description',
                options: ['game2_q4_a_button', 'game2_q4_b_button', 'game2_q4_c_button', 'game2_q4_d_button'],
                answer: 3,
            },
            {
                question: 'game2_q5',
                description: 'game2_q5_description',
                options: ['game2_q5_a_button', 'game2_q5_b_button', 'game2_q5_c_button', 'game2_q5_d_button'],
                answer: 0,
            }
        ]

        const questionTitles = [
            "game2_q1_title",
            "game2_q2_title",
            "game2_q3_title"
        ]

        const selectedQuestions = Phaser.Utils.Array.Shuffle([...allQuestions]).slice(0, 3);

        this.questionPanel = new QuestionPanel_2(this, selectedQuestions, questionTitles, () => {
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
        this.video?.destroy();
    }

    showWin() {
        this.questionPanel.setVisible(false);

    }
    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game2_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }
}
