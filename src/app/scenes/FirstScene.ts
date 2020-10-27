import { Platform } from '@ionic/angular';

declare var Phaser;
export class FirstScene extends Phaser.Scene {
    width
    height
    score
    scoreText;
    text

    constructor(config) {
        super(config);
    }
    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

        //carrega plugin rex
        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);
        this.width = this.game.config.width;
        this.height = this.game.config.height;
    }

    create() {
        let heightBackGround;

        if (this.height > 700)
            heightBackGround = this.height * 0.29;
        else
            heightBackGround = this.height * 0.25;

        //create background
        this.add.image(this.width * 0.5, heightBackGround, 'sky');

        //create ground
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(this.width * 0.5, this.height * 0.7, 'ground').setScale(2).refreshBody();

        this.platforms.create(this.width * 1.1, this.height * 0.5, 'ground');
        this.platforms.create(this.width * -0.1, this.height * 0.25, 'ground');
        this.platforms.create(this.width * 1.4, this.height * 0.35, 'ground');

        //create player
        this.player = this.physics.add.sprite(this.width * 0.2, this.height * 0.5, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //add colision
        this.physics.add.collider(this.player, this.platforms);

        //create cursores
        this.cursors = this.input.keyboard.createCursorKeys();

        //add stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: Math.trunc((this.width - 12) / 70),
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        //add colision stars with platforms
        this.physics.add.collider(this.stars, this.platforms);

        //call function that disable star
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        //create scores
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.score = 0;

        //create bombs and add colisions
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        //create joystic
        this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: this.width * 0.5,
            y: this.height * 0.85,
            radius: this.width * 0.2,
            base: this.add.circle(0, 0, this.width * 0.2, 0x888888),
            thumb: this.add.circle(0, 0, this.width * 0.2 * 0.5, 0xcccccc),
            // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            forceMin: 16,
            enable: true
        })
            .on('update', this.dumpJoyStickState, this);

        this.text = this.add.text(4000, 4000);
        this.dumpJoyStickState();
    }

    update() {
        if (this.text._text.includes('left')) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.text._text.includes('right')) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.text._text.includes('up') && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Pontos: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        this.gameOver = true;
    }

    dumpJoyStickState() {
        var cursorKeys = this.joyStick.createCursorKeys();
        var s = 'Key down: ';
        for (var name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                s += name + ' ';
            }
        }
        s += '\n';
        s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
        s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
        this.text.setText(s);
    }


}
