import { CustomButton } from '../UI/Button.js';
import UIHelper from '../UI/UIHelper.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import NpcHelper from '../Character/NpcHelper.js';
import GameManager from './GameManager.js';

export class MainStreetScene extends Phaser.Scene {
    constructor() {
        super('MainStreetScene');
    }

    preload() {

        // Create loading bar UI
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Loading bar background
        const barBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
        barBg.setStrokeStyle(2, 0xffffff);

        // Loading bar fill
        const barFill = this.add.rectangle(width / 2 - 195, height / 2, 0, 22, 0x00ff00);
        barFill.setOrigin(0, 0.5);

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, '載入中...', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Percentage text
        const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Update progress bar on load progress
        this.load.on('progress', (value) => {
            barFill.width = 390 * value;
            percentText.setText(Math.round(value * 100) + '%');
        });

        // Minimum wait time in ms (30 seconds)
        const minWaitTime = 30000;
        const startTime = Date.now();
        let isAssetsLoaded = false;

        const checkLoadingComplete = () => {
            const elapsedTime = Date.now() - startTime;
            if (isAssetsLoaded && elapsedTime >= minWaitTime) {
                barBg.destroy();
                barFill.destroy();
                loadingText.destroy();
                percentText.destroy();
            } else if (isAssetsLoaded) {
                // If assets loaded but time hasn't passed, check again later
                const remainingTime = minWaitTime - elapsedTime;
                this.time.delayedCall(remainingTime, checkLoadingComplete, [], this);
            }
        };

        // Clean up when loading complete
        this.load.on('complete', () => {
            isAssetsLoaded = true;
            checkLoadingComplete();
        });

        // // Only load spritesheets for the selected gender
        let gender = 'F';
        try {
            if (localStorage.getItem('player')) {
                gender = JSON.parse(localStorage.getItem('player')).gender || 'M';
            }
        } catch (e) {
            gender = 'M';
        }

        //main street backgrounds
        this.load.image('stage1', 'assets/images/MainStreet/stage1.png');
        this.load.image('stage2', 'assets/images/MainStreet/stage2.png');
        this.load.image('stage3', 'assets/images/MainStreet/stage3.png');

        for (let i = 1; i <= 5; i++) {
            this.load.image(`object${i}`, `assets/images/MainStreet/object${i}.png`);
        }
        this.load.image('gameintro_01', 'assets/images/MainStreet/gameintro.png');
        this.load.image('gametimer', 'assets/images/MainStreet/gameintro_timer.png');

        this.load.image('npc1_bubble_1', 'assets/images/Game_1/game1_npc_box1.png');

        this.load.image('npc2_bubble_1', 'assets/images/Game_2/game2_npc_box1.png');

        this.load.image('npc3_bubble_1', 'assets/images/Game_3/game3_npc_box3.png');
        this.load.image('npc3_bubble_reject_01', 'assets/images/Game_3/game3_npc_box1.png');
        this.load.image('npc3_bubble_reject_02', 'assets/images/Game_3/game3_npc_box2.png');


        this.load.image('npc4_bubble_1', 'assets/images/Game_4/game4_npc_box3.png');
        this.load.image('npc4_bubble_reject_01', 'assets/images/Game_4/game4_npc_box1.png');
        this.load.image('npc4_bubble_reject_02', 'assets/images/Game_4/game4_npc_box2.png');

        this.load.image('npc5_bubble_reject_01', 'assets/images/Game_5/game5_npc_box1.png');
        this.load.image('npc5_bubble_reject_02', 'assets/images/Game_5/game5_npc_box2.png');

        if (gender === 'M') {
            this.load.image('npc5_bubble_1', 'assets/images/Game_5/game5_npc_box3_boy.png');
            this.load.image('npc5_bubble_2', 'assets/images/Game_5/game5_npc_box4_boy.png');
        } else {
            this.load.image('npc5_bubble_1', 'assets/images/Game_5/game5_npc_box3_girl.png');
            this.load.image('npc5_bubble_2', 'assets/images/Game_5/game5_npc_box4_girl.png');
        }
        this.load.image('npc5_bubble_3', 'assets/images/Game_5/game5_npc_box5.png');
        this.load.image('npc5_bubble_4', 'assets/images/Game_5/game5_npc_box6.png');


        this.load.image('npc6_bubble_1', 'assets/images/Game_6/game6_npc_box1.png');
        this.load.image('npc6_bubble_2', 'assets/images/Game_6/game6_npc_box2.png');



        if (gender === 'M') {
            this.load.spritesheet('boy_idle', 'assets/images/MainStreet/Boy/maincharacter_boy_middlestand.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_left_talk', 'assets/images/MainStreet/Boy/maincharacter_boy_lefttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_right_talk', 'assets/images/MainStreet/Boy/maincharacter_boy_righttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_left_walk', 'assets/images/MainStreet/Boy/maincharacter_boy_leftwalk.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_right_walk', 'assets/images/MainStreet/Boy/maincharacter_boy_rightwalk.png',
                { frameWidth: 300, frameHeight: 350 });
        }

        if (gender === 'F') {
            this.load.spritesheet('girl_idle', 'assets/images/MainStreet/Girl/maincharacter_girl_middlestand.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_left_talk', 'assets/images/MainStreet/Girl/maincharacter_girl_lefttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_right_talk', 'assets/images/MainStreet/Girl/maincharacter_girl_righttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_left_walk', 'assets/images/MainStreet/Girl/maincharacter_girl_leftwalk.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_right_walk', 'assets/images/MainStreet/Girl/maincharacter_girl_rightwalk.png',
                { frameWidth: 300, frameHeight: 350 });
        }

        // // NPC spritesheets
        for (let i = 1; i <= 3; i++) {
            this.load.image(`npc_object${i}`, `assets/images/MainStreet/NPCs/object${i}.png`);
            this.load.image(`npc_object${i}_glow`, `assets/images/MainStreet/NPCs/object${i}_glow.png`);
        }


        this.load.spritesheet('npc1', 'assets/images/MainStreet/NPCs/NPC1.png', {
            frameWidth: 189,
            frameHeight: 303
        });
        this.load.spritesheet('npc1_glow', 'assets/images/MainStreet/NPCs/NPC1_glow.png', {
            frameWidth: 189,
            frameHeight: 303
        });
        this.load.spritesheet('npc2', 'assets/images/MainStreet/NPCs/NPC2.png',
            { frameWidth: 157.5, frameHeight: 287.5 });
        this.load.spritesheet('npc2_glow', 'assets/images/MainStreet/NPCs/NPC2_glow.png',
            { frameWidth: 157.5, frameHeight: 287.5 });
        this.load.spritesheet('npc3', 'assets/images/MainStreet/NPCs/NPC3.png',
            { frameWidth: 147.5, frameHeight: 291.5 });
        this.load.spritesheet('npc3_glow', 'assets/images/MainStreet/NPCs/NPC3_glow.png',
            { frameWidth: 147.5, frameHeight: 291.5 });
        this.load.spritesheet('npc4', 'assets/images/MainStreet/NPCs/NPC4.png',
            { frameWidth: 182, frameHeight: 304 });
        this.load.spritesheet('npc4_glow', 'assets/images/MainStreet/NPCs/NPC4_glow.png',
            { frameWidth: 182, frameHeight: 304 });
        this.load.spritesheet('npc1b', 'assets/images/MainStreet/NPCs/NPC1B.png',
            {
                frameWidth: 189,
                frameHeight: 303
            });
        this.load.spritesheet('npc1b_glow', 'assets/images/MainStreet/NPCs/NPC1B_glow.png',
            {
                frameWidth: 189,
                frameHeight: 303
            });
    }

    create() {
        // Create NPC animations
        this.createAnimations();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.centerX = width / 2;
        this.centerY = height / 2;

        const gender = localStorage.getItem('player') ? JSON.parse(localStorage.getItem('player')).gender : 'F';

        this.genderKey = gender === 'M' ? 'boy' : 'girl';
        const genderKey = this.genderKey;

        this.minXClamp = 7300;
        this.maxXClamp = 4200;

        console.log(`Player gender: ${gender}, genderKey: ${genderKey}`);

        const bgKeys = ['stage1', 'stage2', 'stage3'];

        let currentX = 0;
        //background
        bgKeys.forEach((key, index) => {
            const bg = this.add.image(currentX, 540, key).setOrigin(0, 0.5).setDepth(1);
            currentX += bg.width;
        });
        this.object1 = this.add.image(1355, 970, 'object1').setDepth(15).setScale(1);
        this.object2 = this.add.image(1720, 530, 'object2').setDepth(15).setScale(1);
        this.object3 = this.add.image(2600, 555, 'object3').setDepth(15).setScale(1.1);
        this.object4 = this.add.image(3810, 555, 'object4').setDepth(15).setScale(1.1);
        this.object5 = this.add.image(1850, 685, 'object5').setDepth(14).setScale(1).setVisible(false);



        this.bubbleTimers = [];
        const npc1_bubbles = ['npc1_bubble_1'];
        const npc2_bubbles = ['npc2_bubble_1'];
        const npc3_bubbles = ['npc3_bubble_1'];
        const npc3_reject_bubbles = ['npc3_bubble_reject_01', 'npc3_bubble_reject_02'];

        const npc4_bubbles = ['npc4_bubble_1'];
        const npc4_reject_bubbles = ['npc4_bubble_reject_01', 'npc4_bubble_reject_02'];

        const npc5_bubbles = ['npc5_bubble_1', 'npc5_bubble_2', 'npc5_bubble_3', 'npc5_bubble_4'];
        const npc5_reject_bubbles = ['npc5_bubble_reject_01', 'npc5_bubble_reject_02'];
        const npc6_bubbles = ['npc6_bubble_1', 'npc6_bubble_2'];

        // NPCs (trigger game)
        this.interactiveNpcs = [];

        const n1 = NpcHelper.createNpc(this, 1, 3300, 670, 1, 'npc1', npc1_bubbles, 6, 'npc1_anim');
        const n2 = NpcHelper.createNpc(this, 2, 2380, 670, 1, 'npc2', npc2_bubbles, 6, 'npc2_anim');
        const n3 = NpcHelper.createNpc(this, 3, 4220, 680, 1, 'npc3', npc3_bubbles, 6, 'npc3_anim');
        const n4 = NpcHelper.createNpc(this, 4, 1480, 650, 1, 'npc4', null, 6, 'npc4_anim'); // no game
        const n1b = NpcHelper.createNpc(this, 5, 730, 670, 1, 'npc1b', null, 6, 'npc1b_anim');

        const objectNpc1 = NpcHelper.createNpcItem(this, 6, 2100, 585, 1, 'npc_object1', 'npc_object1_glow', 5);
        objectNpc1.bubbles = npc4_bubbles;

        const objectNpc2 = NpcHelper.createNpcItem(this, 7, 1850, 625, 1, 'npc_object2', 'npc_object2_glow', 15);
        objectNpc2.bubbles = npc5_bubbles;

        const objectNpc3 = NpcHelper.createNpcItem(this, 8, 1190, 130, 1, 'npc_object3', 'npc_object3_glow', 15);
        objectNpc3.bubbles = npc6_bubbles;


        this.interactiveNpcs.push(n1);
        this.interactiveNpcs.push(n2);
        this.interactiveNpcs.push(n3);
        this.interactiveNpcs.push(objectNpc1);
        this.interactiveNpcs.push(objectNpc2);
        this.interactiveNpcs.push(objectNpc3);


        this.currentInteractiveNpc = null;

        // Add global input listener to stop movement when pointer is released anywhere
        this.input.on('pointerup', () => {
            this.isLeftDown = false;
            this.isRightDown = false;
        });

        const npcGameMap = { 1: 1, 2: 2, 3: 3, 6: 4, 7: 5, 8: 6 };
        this.interactiveNpcs.forEach((npc, index) => {
            npc.on('pointerdown', () => {
                if (npc.canInteract) {
                    const gameNumber = npcGameMap[npc.id] ?? (index + 1);
                    const sceneKey = `GameScene_${gameNumber}`;
                    const characterbubble = `game${gameNumber}_${genderKey}_bubble`;
                    this.loadBubble(0, npc.bubbles, sceneKey, npc, characterbubble);
                }
            });
        });

        // 判斷關卡1到5是否完成
        const game1Result = GameManager.loadOneGameResult(1);
        const game2Result = GameManager.loadOneGameResult(2);
        const game3Result = GameManager.loadOneGameResult(3);
        const game4Result = GameManager.loadOneGameResult(4);
        const game5Result = GameManager.loadOneGameResult(5);

        // 遊戲1完成：隱藏 npc1，顯示 npc1b
        if (game1Result && game1Result.isFinished) {
            n1.setVisible(false);
            n1.active = false;
            const idx = this.interactiveNpcs.indexOf(n1);
            if (idx > -1) this.interactiveNpcs.splice(idx, 1);

            n1b.setVisible(true);
        } else {
            n1.setVisible(true);
            n1b.setVisible(false);
        }

        // 遊戲2完成：移動 npc2
        if (game2Result && game2Result.isFinished) {
            n2.x = 1130;
            const idx = this.interactiveNpcs.indexOf(n2);
            if (idx > -1) this.interactiveNpcs.splice(idx, 1);
        }


        const isGame1To5Finished = (game1Result && game1Result.isFinished) &&
            //(game2Result && game2Result.isFinished) &&
            // (game3Result && game3Result.isFinished) &&
            // (game4Result && game4Result.isFinished) &&
            (game5Result && game5Result.isFinished);

        if (isGame1To5Finished) {
            this.minXClamp = 880;
            this.maxXClamp = 4200;
            this.object5 = this.add.image(1850, 685, 'object5').setDepth(14).setScale(1).setVisible(true);

            // Destroy objectNpc2 completely and remove it from interaction list
            objectNpc2.destroy();
            const idx = this.interactiveNpcs.indexOf(objectNpc2);
            if (idx > -1) this.interactiveNpcs.splice(idx, 1);

            console.log("Game 1 and 5 finished. Using triggeredBackgroundSettings.");
        } else {

            this.minXClamp = 2000;
            this.maxXClamp = 4200;
            console.log("Game 1 to 5 not finished. Using defaultBackgroundSettings.");
        }

        // 設定相機邊界為總長度 8414px
        this.cameras.main.setBounds(0, 0, 4400, 1080);

        const introPage = [
            {
                content: 'gameintro_01',
                nextBtn: null, nextBtnClick: null,
                prevBtn: null, prevBtnClick: null,
                closeBtn: 'gameintro_closebutton', closeBtnClick: 'gameintro_closebutton_click'
            },
        ]

        const ui = UIHelper.createGameCommonUI(this, null, introPage, 0);
        ui.descriptionPanel.setVisible(true);

        // Check if intro has been seen in this session
        const hasSeenIntro = sessionStorage.getItem('hasSeenMainStreetIntro');
        if (hasSeenIntro) {
            if (ui && ui.descriptionPanel) {
                ui.descriptionPanel.setVisible(false);
            }
        } else {
            sessionStorage.setItem('hasSeenMainStreetIntro', 'true');
        }

        //buttons
        this.isLeftDown = false;
        this.isRightDown = false;
        this.isTalking = false;

        this.btnLeft = new CustomButton(this, 150, height / 2, 'prev_button', 'prev_button_click',
            () => {
                this.isLeftDown = true;
                this.handleAnimation(genderKey, true, true);
            },
            () => {
                this.isLeftDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);

        this.btnRight = new CustomButton(this, width - 150, height / 2, 'next_button', 'next_button_click',
            () => {
                this.isRightDown = true;
                this.handleAnimation(genderKey, true, false);
            },
            () => {
                this.isRightDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);

        const playerPos = localStorage.getItem('playerPosition') ? JSON.parse(localStorage.getItem('playerPosition')) :
            { x: 3000, y: 730 };
        this.playerPos = playerPos;

        // Start player at saved position (clamped to camera bounds)
        const startX = Phaser.Math.Clamp(this.playerPos.x ?? 3500, this.minXClamp, this.maxXClamp);
        const startY = this.playerPos.y ?? 730;

        this.playerSprite = this.add.sprite(startX, startY,
            `${genderKey}_idle`).setDepth(14).setScale(2);

        this.playerSprite.anims.play(`${genderKey}_idle_anim`);

        // 將相機鎖定在玩家身上
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    }

    update() {
        const speed = 5;
        let isMoving = false;
        let isLeft = this.playerSprite.lastDirectionLeft; // 保持最後的方向狀態

        // 純按鈕判定
        if (this.isLeftDown) {
            this.playerSprite.x -= speed;
            isLeft = true;
            isMoving = true;
        } else if (this.isRightDown) {
            this.playerSprite.x += speed;
            isLeft = false;
            isMoving = true;
        } else {
            this.playerSprite.x += 0;
            isMoving = false;
        }
        this.playerSprite.lastDirectionLeft = isLeft;

        this.playerSprite.x = Phaser.Math.Clamp(this.playerSprite.x, this.minXClamp, this.maxXClamp);


        const allNpcs = [...this.interactiveNpcs];
        this.currentNpcActivated = null;

        allNpcs.forEach(npc => {
            const dist = Math.abs(this.playerSprite.x - npc.x);

            if (dist < npc.proximityDistance) {
                npc.canInteract = true;
                //  npc.setTint(0x888888);
                this.switchToGlowAndBack(npc);
            } else {
                npc.canInteract = false;
                //  npc.setTint(0xffffff);
                this.restoreFromGlow(npc);

                // IF THIS NPC was the one owning the active bubbles
                if ((this.currentActiveBubble && this.currentActiveBubble.ownerNpc === npc) ||
                    (this.characterActiveBubble && this.characterActiveBubble.ownerNpc === npc)) {

                    // 1. Clear all pending timers to prevent bubbles "popping up" later
                    this.bubbleTimers.forEach(t => t.remove());
                    this.bubbleTimers = [];

                    // 2. Destroy NPC Bubble
                    if (this.currentActiveBubble) {
                        this.currentActiveBubble.destroy();
                        this.currentActiveBubble = null;
                    }

                    // 3. Destroy Character Bubble
                    if (this.characterActiveBubble) {
                        this.characterActiveBubble.destroy();
                        this.characterActiveBubble = null;
                    }
                }
            }
        });
    }

    switchToGlowAndBack(npc, glow) {
        if (!npc || npc.isGlow) return;
        if (!npc.glowKey) return;

        npc.setTexture(npc.glowKey);
        if (npc.glowAnimKey) {
            npc.play(npc.glowAnimKey, true);
        }
        npc.isGlow = true;
    }

    restoreFromGlow(npc) {
        if (!npc || !npc.isGlow) return;
        if (!npc.baseKey) return;

        npc.setTexture(npc.baseKey);
        if (npc.baseAnimKey) {
            npc.play(npc.baseAnimKey, true);
        }
        npc.isGlow = false;
    }

    handleAnimation(gender, isMoving, isLeft) {
        let walkKey = `${gender}_left_walk_anim`;
        let idleKey = `${gender}_idle_anim`;

        if (isMoving) {
            // true means: if 'walkKey' is already playing, don't restart it
            this.playerSprite.play(walkKey, true);
            if (!isLeft) {
                this.playerSprite.setFlipX(true);
            } else {
                this.playerSprite.setFlipX(false);
            }
        } else {
            this.playerSprite.play(idleKey, true);
        }
    }

    switchTalkingAnimation(gender, isLeft) {
        if (isLeft === undefined) isLeft = this.playerSprite.lastDirectionLeft;
        let talkKey = isLeft ? `${gender}_left_talk_anim` : `${gender}_right_talk_anim`;
        this.playerSprite.play(talkKey, true);
        this.playerSprite.setFlipX(false); // talking animations seem to have dedicated left/right sprites
    }


    loadBubble(index = 0, bubbles, sceneKey, targetNpc, characterbubble) {

        if (this.currentActiveBubble) {
            this.currentActiveBubble.destroy();
        }
        if (this.characterActiveBubble) {
            this.characterActiveBubble.destroy();
        }

        this.bubbleImg = this.add.image(this.centerX, 900, bubbles[index])
            .setDepth(200)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);

        // 綁定當前 NPC 到對話框，方便 update 檢查距離
        this.bubbleImg.ownerNpc = targetNpc;
        this.currentActiveBubble = this.bubbleImg;

        this.switchTalkingAnimation(this.genderKey, targetNpc.x < this.playerSprite.x);

        this.characterBubbleImg = this.add.image(this.centerX, 900, characterbubble)
            .setDepth(200)
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .setScrollFactor(0);

        this.characterActiveBubble = this.characterBubbleImg;
        this.characterActiveBubble.ownerNpc = targetNpc;


        this.bubbleImg.on('pointerdown', () => {
            this.bubbleImg.destroy();
            this.currentActiveBubble = null;

            // If there is another bubble in the sequence, show it instead of the character bubble.
            if (index < bubbles.length - 1) {
                this.loadBubble(index + 1, bubbles, sceneKey, targetNpc, characterbubble);
                return;
            }

            this.time.delayedCall(500, () => {
                if (sceneKey && targetNpc.canInteract) {
                    localStorage.setItem('playerPosition', JSON.stringify({ x: this.playerSprite.x, y: this.playerSprite.y }));
                    GameManager.switchToGameScene(this, sceneKey);
                }
            });
        });

        // Store this timer so we can stop i

        // 彈出動畫
        this.tweens.add({
            targets: this.bubbleImg,
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: this.characterBubbleImg,
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    createAnimations() {

        // NPC Animations
        this.anims.create({
            key: 'npc1_anim',
            frames: this.anims.generateFrameNumbers('npc1', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc1_glow_anim',
            frames: this.anims.generateFrameNumbers('npc1_glow', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc1b_anim',
            frames: this.anims.generateFrameNumbers('npc1b', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc1b_glow_anim',
            frames: this.anims.generateFrameNumbers('npc1b_glow', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc2_anim',
            frames: this.anims.generateFrameNumbers('npc2', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc2_glow_anim',
            frames: this.anims.generateFrameNumbers('npc2_glow', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc3_anim',
            frames: this.anims.generateFrameNumbers('npc3', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc3_glow_anim',
            frames: this.anims.generateFrameNumbers('npc3_glow', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc4_anim',
            frames: this.anims.generateFrameNumbers('npc4', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'npc4_glow_anim',
            frames: this.anims.generateFrameNumbers('npc4_glow', { start: 0, end: 47 }),
            frameRate: 24,
            repeat: -1
        });


        // Player character animations

        this.anims.create({
            key: 'boy_idle_anim',
            frames: this.anims.generateFrameNumbers('boy_idle', { start: 0, end: 152 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_left_talk_anim',
            frames: this.anims.generateFrameNumbers('boy_left_talk', { start: 0, end: 168 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_right_talk_anim',
            frames: this.anims.generateFrameNumbers('boy_right_talk', { start: 0, end: 168 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_left_walk_anim',
            frames: this.anims.generateFrameNumbers('boy_left_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_right_walk_anim',
            frames: this.anims.generateFrameNumbers('boy_right_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_idle_anim',
            frames: this.anims.generateFrameNumbers('girl_idle', { start: 0, end: 148 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_left_talk_anim',
            frames: this.anims.generateFrameNumbers('girl_left_talk', { start: 0, end: 95 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_right_talk_anim',
            frames: this.anims.generateFrameNumbers('girl_right_talk', { start: 0, end: 49 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_left_walk_anim',
            frames: this.anims.generateFrameNumbers('girl_left_walk', { start: 0, end: 23 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_right_walk_anim',
            frames: this.anims.generateFrameNumbers('girl_right_walk', { start: 0, end: 23 }),
            frameRate: 10,
            repeat: -1
        });
    }

}