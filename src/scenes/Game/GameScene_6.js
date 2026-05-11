
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_6 extends BaseGameScene {
    constructor() {
        super('GameScene_6');
    }

    preload() {
        this.load.audio('bgm', 'assets/music/bgm.mp3');
        const path = 'assets/images/Game_6/';


        this.gender = 'F';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }
        if (this.gender === 'M') {
            this.load.image('game6_bg', `${path}game6_bg_boy.png`);
            this.load.video('game6_talk_video', path + 'game6_bg_boy.mp4');
            this.load.image('game6_npc_q1_char_win', `${path}game6_npc_box2_boy.png`);
            this.load.image('game6_npc_q2_char_win', `${path}game6_npc_box4_boy.png`);
            this.load.image('game6_npc_q3_char_win', `${path}game6_npc_box6_boy.png`);
            this.load.image('game6_npc_char_win', `${path}game6_npc_box7_boy.png`);

        } else {
            this.load.image('game6_bg', `${path}game6_bg_girl.png`);
            this.load.video('game6_talk_video', path + 'game6_bg_girl.mp4');
            this.load.image('game6_npc_q1_char_win', `${path}game6_npc_box2_girl.png`);
            this.load.image('game6_npc_q2_char_win', `${path}game6_npc_box4_girl.png`);
            this.load.image('game6_npc_q3_char_win', `${path}game6_npc_box6_girl.png`);
            this.load.image('game6_npc_char_win', `${path}game6_npc_box7_girl.png`);

        }

        // NPC dialogue boxes (in ascending order)
        this.load.image('game6_npc_q1_npc_win', `${path}game6_npc_box1.png`);
        this.load.image('game6_npc_q2_npc_win', `${path}game6_npc_box3.png`);
        this.load.image('game6_npc_q3_npc_win', `${path}game6_npc_box5.png`);
        this.load.image('game6_npc_win', `${path}game6_npc_box8.png`);

        this.load.image('game6_npc_box_tryagain', `${path}game6_npc_box9.png`);

        // UI buttons
        this.load.image('confirm_button', `${path}game6_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game6_confirm_button_select.png`);

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game6_q${i}`, `${path}game6_q${i}.png`);
            this.load.image(`game6_q${i}_a_button`, `${path}game6_q${i}_a_button.png`);
            this.load.image(`game6_q${i}_b_button`, `${path}game6_q${i}_b_button.png`);
            this.load.image(`game6_q${i}_c_button`, `${path}game6_q${i}_c_button.png`);
            this.load.image(`game6_q${i}_d_button`, `${path}game6_q${i}_d_button.png`);
            this.load.image(`game6_q${i}_a_button_select`, `${path}game6_q${i}_a_button_select.png`);
            this.load.image(`game6_q${i}_b_button_select`, `${path}game6_q${i}_b_button_select.png`);
            this.load.image(`game6_q${i}_c_button_select`, `${path}game6_q${i}_c_button_select.png`);
            this.load.image(`game6_q${i}_d_button_select`, `${path}game6_q${i}_d_button_select.png`);
        }

    }

    create() {

        if (this.sound.getAll('bgm').length === 0) {
            this.sound.play('bgm', { loop: true, volume: 0.5 });
        }

        // Pass null for bgKey since using video background
        this.initGame('game6_bg', 'game6_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 6
        });

        this.gameUI.itemBtn.setVisible(false);

    }

    setupGameObjects() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
            this.questionPanel = null;
        }

        const allQuestions = [
            {
                content: 'game6_q1',
                options: ['game6_q1_a_button', 'game6_q1_b_button', 'game6_q1_c_button', 'game6_q1_d_button'],
                answer: 0,
                dialoges: [
                    'game6_npc_q1_npc_win', 'game6_npc_q1_char_win'
                ]
            },
            {
                content: 'game6_q2',
                options: ['game6_q2_a_button', 'game6_q2_b_button', 'game6_q2_c_button', 'game6_q2_d_button'],
                answer: 3,
                dialoges: [
                    'game6_npc_q2_npc_win', 'game6_npc_q2_char_win'
                ]

            },
            {
                content: 'game6_q3',
                options: ['game6_q3_a_button', 'game6_q3_b_button', 'game6_q3_c_button', 'game6_q3_d_button'],
                answer: 1,
                dialoges: [
                    'game6_npc_q3_npc_win', 'game6_npc_q3_char_win',
                    'game6_npc_char_win', 'game6_npc_win'
                ]
            }
        ];


        this.questionPanel = new QuestionPanel(this, allQuestions, () => {
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

        if (this.dialogVideo) {
            this.dialogVideo.destroy();
            this.dialogVideo = null;
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
            content: 'game6_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.closeBtn.setVisible(false); // 先隱藏關閉按鈕
        objectPanel.setDepth(802);
        objectPanel.show();
    }


    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        if (isFinalWin) {
            this.gameTimer.stop();
            this._calculateTiming(true);
            this.enableGameInteraction(false);

            this.showFeedbackLabel(true);
            this.showBubble('noBubble');
        }
        this.updateRoundUI(true);

    }

    showFailPanel() {
        // 確保這是在所有東西的最上層
        const popupPanel = new CustomFailPanel(this, 960, 540, () => {
            popupPanel.destroy();
            this.restartGame(); // 重新開始整個遊戲
        }, () => {
            //GameManager.backToMainStreet(this);
        });
        popupPanel.setDepth(1000);
    }

}
