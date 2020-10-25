import { Component } from '@angular/core';
import { FirstScene } from '../scenes/FirstScene';

declare var Phaser;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200 }
      }
    },
    scene: [FirstScene]
  };
  constructor() { }

  ionViewWillEnter() {
    new Phaser.Game(this.config);
  }
}
