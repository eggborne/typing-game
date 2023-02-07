import './css/styles.css';
import {
  randomInt,
  pause,
  distanceFromABToXY,
  pointAtAngle,
  angleOfPointABFromXY,
  degToRad,
  radToDeg
} from './util.js';

let game;

window.addEventListener('load', async () => {
  await pause(500);
  game = new Game();
  game.createEgg();
  
  game.loop();
});

window.addEventListener('keydown', (e) => {
  game.egg.aimCannon(game.activeWordShips[game.activeWordShips.length-1].div);
});

class Game {
  constructor() {
    this.activeWordShips = [];
    this.tickCount = 0;
    this.over = false;

    document.body.classList.remove('over');
  }

  createEgg() {
    this.egg = new Egg();
  }

  launchWordShip(word) {
    let newShip = new WordShip(word);
    newShip.goal = {
      x: document.getElementById('egg').clientTop,
      y: document.getElementById('egg').clientLeft,
    };
    this.activeWordShips.push(newShip);
  }

  loop() {
    if (this.tickCount % 100 === 0) {
      this.launchWordShip('chihuahua');
    }
    this.tickCount++;
    // document.getElementById('ticker').innerText = this.tickCount;
    for (const ship of this.activeWordShips) {
      ship.fly();
    }
    this.activeWordShips[0].fly();
    if (!this.over) {
      requestAnimationFrame(() => {
        this.loop();
      });
    }
  }
}

class Egg {
  constructor() {
    this.weapons = [];
    this.div = document.createElement('div');
    this.div.id = 'egg';
    this.gun = document.createElement('div');
    this.gun.classList.add('extended');
    this.gun.id = 'egg-gun';
    this.div.append(this.gun);
    document.querySelector('main').append(this.div);
    this.position = {
      x: this.div.offsetLeft,
      y: this.div.offsetTop,
    };
  }

  aimCannon(targetElement) {
    let targX = targetElement.offsetLeft + (targetElement.clientWidth / 2);
    let targY = targetElement.offsetTop + (targetElement.clientHeight / 2);
    let aimAngle = radToDeg(angleOfPointABFromXY(targX, targY, this.position.x, this.position.y));
    this.div.style.rotate = `${aimAngle}deg`;
  }
}


class WordShip {
  constructor(word) {
    this.word = word;
    this.div = document.createElement('div');
    this.div.classList.add('word-ship');
    this.div.id = `${this.word}-ship`;
    this.div.innerText = word;
    if (randomInt(0, 1)) {
      // just off top or bottom, random full range left-right
      this.div.style[randomInt(0, 1) ? 'top' : 'bottom'] = '0';
      this.div.style.left = randomInt(0, window.innerWidth) + 'px';
    } else {
      // just off left or right, random full range top-bottom
      this.div.style[randomInt(0, 1) ? 'left' : 'right'] = '0';
      this.div.style.top = randomInt(0, window.innerHeight) + 'px';
    }
    document.querySelector('main').append(this.div);
  }

  fly() {
    this.div.style.left = `${ parseInt(this.div.style.left) + 2 }px`
  }
}


