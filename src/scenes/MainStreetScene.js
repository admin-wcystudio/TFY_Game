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

        this.load.audio('bgm', 'assets/music/bgm.mp3');
        //main street backgrounds
        this.load.image('stage1', 'assets/images/MainStreet/stage_stage1.png');
        this.load.image('stage2', 'assets/images/MainStreet/stage_stage2.png');
        this.load.image('stage3', 'assets/images/MainStreet/stage_stage3.png');
        this.load.image('stage4', 'assets/images/MainStreet/stage_stage4.png');

        for (let i = 1; i <= 2; i++) {
            this.load.image(`object${i}`, `assets/images/MainStreet/stage_object${i}.png`);
        }

        this.load.image('npc7', 'assets/images/MainStreet/NPCs/NPC7.png');
        this.load.image('npc7_select', 'assets/images/MainStreet/NPCs/NPC7_select.png');

        this.load.image('gameintro', 'assets/images/MainStreet/gameintro.png');

        this.load.image('npc1_bubble_1', 'assets/images/Game_1/game1_npc_box1.png');
        this.load.image('npc2_bubble_1', 'assets/images/Game_2/game2_npc_box1.png');
        this.load.image('npc3_bubble_1', 'assets/images/Game_3/game3_npc_box1.png');

        this.load.image('npc4_bubble_reject', 'assets/images/Game_4/game4_npc_box1.png');
        this.load.image('npc4_bubble_reject_02', 'assets/images/Game_4/game4_npc_box2.png');
        this.load.image('npc4_bubble_1', 'assets/images/Game_4/game4_npc_box3.png');

        this.load.image('npc5_bubble_1', 'assets/images/Game_5/game5_npc_box3.png');

        this.load.image('npc5_bubble_reject', 'assets/images/Game_5/game5_npc_box1.png');
        this.load.image('npc5_bubble_reject_02', 'assets/images/Game_5/game5_npc_box2.png');

        this.load.image('npc6_bubble_1', 'assets/images/Game_6/game6_npc_box3.png');
        this.load.image('npc6_bubble_2', 'assets/images/Game_6/game6_npc_box4.png');

        this.load.image('npc6_bubble_reject', 'assets/images/Game_6/game6_npc_box1.png');
        this.load.image('npc6_bubble_reject_02', 'assets/images/Game_6/game6_npc_box2.png');

        this.load.image('npc7_bubble_reject', 'assets/images/Game_7/game7_npc_box1.png');
        this.load.image('npc7_bubble_reject_02', 'assets/images/Game_7/game7_npc_box2.png');

        this.load.image('npc7_bubble_1', 'assets/images/Game_7/game7_npc_box3.png');


        // // Only load spritesheets for the selected gender
        let gender = 'M';
        try {
            if (localStorage.getItem('player')) {
                gender = JSON.parse(localStorage.getItem('player')).gender || 'M';
            }
        } catch (e) {
            gender = 'M';
        }

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
        this.load.spritesheet('npc1', 'assets/images/MainStreet/NPCs/game7_NPC1.png',
            { frameWidth: 468, frameHeight: 694 });
        this.load.spritesheet('npc1_select', 'assets/images/MainStreet/NPCs/game7_NPC1_select.png',
            { frameWidth: 468, frameHeight: 694 });
        this.load.spritesheet('npc2', 'assets/images/MainStreet/NPCs/game7_NPC2.png',
            { frameWidth: 403, frameHeight: 528 });
        this.load.spritesheet('npc2_select', 'assets/images/MainStreet/NPCs/game7_NPC2_select.png',
            { frameWidth: 403, frameHeight: 528 });
        this.load.spritesheet('npc3', 'assets/images/MainStreet/NPCs/game7_NPC3.png',
            { frameWidth: 387, frameHeight: 540 });
        this.load.spritesheet('npc3_select', 'assets/images/MainStreet/NPCs/game7_NPC3_select.png',
            { frameWidth: 387, frameHeight: 540 });
        this.load.spritesheet('npc4', 'assets/images/MainStreet/NPCs/game7_NPC4.png',
            { frameWidth: 283, frameHeight: 449 });
        this.load.spritesheet('npc4_select', 'assets/images/MainStreet/NPCs/game7_NPC4_select.png',
            { frameWidth: 283, frameHeight: 449 });
        this.load.spritesheet('npc5', 'assets/images/MainStreet/NPCs/game7_NPC5.png',
            { frameWidth: 316, frameHeight: 434 });
        this.load.spritesheet('npc5_select', 'assets/images/MainStreet/NPCs/game7_NPC5_select.png',
            { frameWidth: 316, frameHeight: 434 });
        this.load.spritesheet('npc6', 'assets/images/MainStreet/NPCs/game7_NPC6.png',
            { frameWidth: 285, frameHeight: 324 });
        this.load.spritesheet('npc6_select', 'assets/images/MainStreet/NPCs/game7_NPC6_select.png',
            { frameWidth: 285, frameHeight: 324 });

        this.load.spritesheet('fakeNpc1', 'assets/images/MainStreet/NPCs/game7_FakeNPC1.png',
            { frameWidth: 267, frameHeight: 234 });
        this.load.spritesheet('fakeNpc2', 'assets/images/MainStreet/NPCs/game7_FakeNPC2.png',
            { frameWidth: 442, frameHeight: 331 });
        this.load.spritesheet('fakeNpc3', 'assets/images/MainStreet/NPCs/game7_FakeNPC3.png',
            { frameWidth: 215, frameHeight: 169 });
        this.load.spritesheet('fakeNpc4', 'assets/images/MainStreet/NPCs/game7_FakeNPC4.png',
            { frameWidth: 404, frameHeight: 324 });
        this.load.spritesheet('fakeNpc5', 'assets/images/MainStreet/NPCs/game7_FakeNPC5.png',
            { frameWidth: 289, frameHeight: 283 });
    }

    create() {
        if (this.sound.getAll('bgm').length === 0) {
            this.sound.play('bgm', { loop: true, volume: 0.5 });
        }

        this.input.on('pointerup', () => {
            this.isLeftDown = false;
            this.isRightDown = false;
        });

        // Create NPC animations
        this.createAnimations();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.centerX = width / 2;
        this.centerY = height / 2;

        const gender = localStorage.getItem('player') ? JSON.parse(localStorage.getItem('player')).gender : 'M';

        this.genderKey = gender === 'M' ? 'boy' : 'girl';
        const genderKey = this.genderKey;

        const playerPos = localStorage.getItem('playerPosition')
            ? JSON.parse(localStorage.getItem('playerPosition')) : { x: 1500, y: 400 };
        this.playerPos = playerPos;


        console.log(`Player gender: ${gender}, genderKey: ${genderKey}`);

        const bgKeys = ['stage1', 'stage2', 'stage3', 'stage4'];
        this.object1 = this.add.image(5240, 850, 'object1').setDepth(16);
        this.object2 = this.add.image(5520, 545, 'object2').setDepth(15).setScale(1.01);


        let currentX = 0;
        //background
        bgKeys.forEach((key, index) => {
            const bg = this.add.image(currentX, 540, key).setOrigin(0, 0.5).setDepth(1);
            currentX += bg.width; // 累加寬度，讓下一張接在後面
        });
        // 設定相機邊界為總長度 8414px
        this.cameras.main.setBounds(0, 0, 7800, 1080);

        const introPage = [
            {
                content: 'gameintro',
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

        this.btnLeft = new CustomButton(this, 150, height / 2 + 100, 'prev_button', 'prev_button_click',
            () => {
                this.isLeftDown = true;
                this.handleAnimation(genderKey, true, true);
            },
            () => {
                this.isLeftDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);

        this.btnRight = new CustomButton(this, width - 150, height / 2 + 100, 'next_button', 'next_button_click',
            () => {
                this.isRightDown = true;
                this.handleAnimation(genderKey, true, false);
            },
            () => {
                this.isRightDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);

        // Stop movement if pointer leaves the game window
        this.input.on('pointerout', () => {
            if (this.isLeftDown) {
                this.isLeftDown = false;
                this.handleAnimation(genderKey, false, true);
            }
            if (this.isRightDown) {
                this.isRightDown = false;
                this.handleAnimation(genderKey, false, false);
            }
        });

        this.bubbleTimers = [];
        const npc1_bubbles = ['npc1_bubble_1'];
        const npc2_bubbles = ['npc2_bubble_1'];
        const npc3_bubbles = ['npc3_bubble_1'];

        const npc4_bubbles = ['npc4_bubble_1'];
        const npc4_reject_bubbles = ['npc5_bubble_reject', 'npc5_bubble_reject_02'];

        const npc5_bubbles = ['npc5_bubble_1'];
        const npc5_reject_bubbles = ['npc5_bubble_reject', 'npc5_bubble_reject_02'];
        const npc6_bubbles = ['npc6_bubble_1', 'npc6_bubble_2'];
        const npc6_reject_bubbles = ['npc6_bubble_reject', 'npc6_bubble_reject_02'];
        const npc7_bubbles = ['npc7_bubble_1'];
        const npc7_reject_bubbles = ['npc7_bubble_reject', 'npc7_bubble_reject_02'];

        // NPCs (trigger game)
        this.interactiveNpcs = [];

        const n1 = NpcHelper.createNpc(this, 1, 720, 650, 2, 'npc1', npc1_bubbles, 6, 'npc1_anim').setScale(0.8);
        const n2 = NpcHelper.createNpc(this, 2, 1900, 650, 2, 'npc2', npc2_bubbles, 6, 'npc2_anim').setScale(0.8);
        const n3 = NpcHelper.createNpc(this, 3, 3800, 650, 2, 'npc3', npc3_bubbles, 6, 'npc3_anim').setScale(0.8);
        const n4 = NpcHelper.createNpc(this, 4, 4800, 650, 2, 'npc4', npc4_bubbles, 6, 'npc4_anim').setScale(0.8);
        const n5 = NpcHelper.createNpc(this, 5, 7000, 600, 2, 'npc5', npc5_bubbles, 6, 'npc5_anim').setScale(0.8);
        const n6 = NpcHelper.createNpc(this, 6, 7450, 650, 2, 'npc6', npc6_bubbles, 6, 'npc6_anim').setScale(0.8);

        const n7 = NpcHelper.createNpcItem(this, 7, 6950, 350, 1, 'npc7', 'npc7_select', 6, npc7_bubbles).setScale(0.8);

        this.interactiveNpcs.push(n1);
        this.interactiveNpcs.push(n2);
        this.interactiveNpcs.push(n3);
        this.interactiveNpcs.push(n4);
        this.interactiveNpcs.push(n5);
        this.interactiveNpcs.push(n6);
        this.interactiveNpcs.push(n7);

        this.currentInteractiveNpc = null;

        const npcGameMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
        this.interactiveNpcs.forEach((npc, index) => {
            npc.on('pointerdown', () => {
                if (npc.canInteract) {
                    const gameNumber = npcGameMap[npc.id] ?? (index + 1);
                    const sceneKey = `GameScene_${gameNumber}`;
                    this.loadBubble(0, npc.bubbles, sceneKey, npc);
                }
            });
        });


        this.playerSprite = this.add.sprite(playerPos.x, playerPos.y,
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

        this.playerSprite.x = Phaser.Math.Clamp(this.playerSprite.x, 800, 6200);


        const allNpcs = [...this.interactiveNpcs];
        this.currentNpcActivated = null;

        allNpcs.forEach(npc => {
            const inRange = Math.abs(this.playerSprite.x - npc.x) < npc.proximityDistance;
            const canGlow = this.isNpcAvailable(npc) && inRange;

            npc.canInteract = canGlow;

            if (canGlow) {
                this.switchToGlowAndBack(npc);
                return;
            }

            this.restoreFromGlow(npc);

            // IF THIS NPC was the one owning the active bubble
            if (this.currentActiveBubble && this.currentActiveBubble.ownerNpc === npc) {

                // 1. Clear all pending timers to prevent bubbles "popping up" later
                this.bubbleTimers.forEach(t => t.remove());
                this.bubbleTimers = [];

                // 2. Destroy NPC Bubble
                if (this.currentActiveBubble) {
                    this.currentActiveBubble.destroy();
                    this.currentActiveBubble = null;
                }

            }
        });
    }

    isNpcAvailable(npc) {
        // Centralized hook for availability rules.
        return npc !== null && npc !== undefined;
    }

    switchToGlowAndBack(npc, glow) {
        if (!npc || npc.isGlow) return;
        if (!npc.glowKey && !npc.glowAnimKey) return;

        if (npc.glowAnimKey && npc.play) {
            npc.play(npc.glowAnimKey, true);
        } else if (npc.glowKey) {
            npc.setTexture(npc.glowKey);
        }
        npc.isGlow = true;
    }

    restoreFromGlow(npc) {
        if (!npc || !npc.isGlow) return;
        if (!npc.baseKey && !npc.baseAnimKey) return;

        if (npc.baseAnimKey && npc.play) {
            npc.play(npc.baseAnimKey, true);
        } else if (npc.baseKey) {
            npc.setTexture(npc.baseKey);
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




    loadBubble(index = 0, bubbles, sceneKey, targetNpc) {

        if (this.currentActiveBubble) {
            this.currentActiveBubble.destroy();
        }

        this.bubbleImg = this.add.image(this.centerX, 900, bubbles[index])
            .setDepth(200)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);

        // 綁定當前 NPC 到對話框，方便 update 檢查距離
        this.bubbleImg.ownerNpc = targetNpc;
        this.currentActiveBubble = this.bubbleImg;

        this.switchTalkingAnimation(this.genderKey, targetNpc.x < this.playerSprite.x);

        this.bubbleImg.on('pointerdown', () => {
            this.bubbleImg.destroy();
            this.currentActiveBubble = null;

            // If there is another bubble in the sequence, show it instead of the character bubble.
            if (index < bubbles.length - 1) {
                this.loadBubble(index + 1, bubbles, sceneKey, targetNpc);
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

    }


    createAnimations() {

        // NPC Animations
        this.anims.create({
            key: 'npc1_anim',
            frames: this.anims.generateFrameNumbers('npc1', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc1_select_anim',
            frames: this.anims.generateFrameNumbers('npc1_select', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc2_anim',
            frames: this.anims.generateFrameNumbers('npc2', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc2_select_anim',
            frames: this.anims.generateFrameNumbers('npc2_select', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc3_anim',
            frames: this.anims.generateFrameNumbers('npc3', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc3_select_anim',
            frames: this.anims.generateFrameNumbers('npc3_select', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc4_anim',
            frames: this.anims.generateFrameNumbers('npc4', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc4_select_anim',
            frames: this.anims.generateFrameNumbers('npc4_select', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc5_anim',
            frames: this.anims.generateFrameNumbers('npc5', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc5_select_anim',
            frames: this.anims.generateFrameNumbers('npc5_select', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc6_anim',
            frames: this.anims.generateFrameNumbers('npc6', { start: 0, end: 19 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'npc6_select_anim',
            frames: this.anims.generateFrameNumbers('npc6_select', { start: 0, end: 19 }),
            frameRate: 15,
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
            frames: this.anims.generateFrameNumbers('boy_left_talk', { start: 0, end: 94 }),
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
            frames: this.anims.generateFrameNumbers('girl_idle', { start: 0, end: 152 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_left_talk_anim',
            frames: this.anims.generateFrameNumbers('girl_left_talk', { start: 0, end: 23 }),
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
            frames: this.anims.generateFrameNumbers('girl_left_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_right_walk_anim',
            frames: this.anims.generateFrameNumbers('girl_right_walk', { start: 0, end: 48 }),
            frameRate: 10,
            repeat: -1
        });
    }

}