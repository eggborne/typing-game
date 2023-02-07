import './css/styles.css';
import {
  randomInt,
  pause,
  distanceFromABToXY,
  pointAtAngle,
  angleOfPointABFromXY,
  degToRad,
  radToDeg
} from './util';
import { sendQuery } from './api';

let game;

window.addEventListener('load', async () => {
  await pause(1000);
  game = new Game();
  await game.fillDictionary();
  console.log(game.dictionary)
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
    this.dictionary = {3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []};
    this.launchFrequency = 150;

    document.body.classList.remove('over');
  }

  async fillDictionary() {
    for (let i = 3; i <= 10; i++) {
      let words = await sendQuery(`https://api.datamuse.com/words?sp=${'?'.repeat(i)}`);
      this.dictionary[i].push(...words)
    }
  }

  createEgg() {
    this.egg = new Egg();
  }

  async launchWordShip() {
    let randomLengthArray = this.dictionary[randomInt(3, 10)];
    let randomWordIndex = randomInt(0, randomLengthArray.length - 1);
    let word = randomLengthArray[randomWordIndex].word
    let newShip = new WordShip(word);
    console.log('word', word, 'is out of the dictionary');
    console.log(this.dictionary);
    randomLengthArray.splice(randomWordIndex, 1);
    newShip.goal = {
      x: document.getElementById('egg').clientTop,
      y: document.getElementById('egg').clientLeft,
    };
    this.activeWordShips.push(newShip);
  }

  loop() {
    if (this.tickCount % this.launchFrequency === 0) {
      this.launchWordShip();
      document.getElementById('ticker').innerText = this.tickCount;
    }
    this.tickCount++;
    for (const ship of this.activeWordShips) {
      ship.fly();
    }
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
    // this.gun.classList.add('extended');
    this.gun.id = 'egg-gun';
    this.div.append(this.gun);
    document.querySelector('main').append(this.div);
    this.position = {
      x: this.div.offsetLeft,
      y: this.div.offsetTop,
    };
  }

  aimCannon(targetElement) {
    this.gun.classList.add('extended');
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
    if (randomInt(0, 0)) {
      // just off top or bottom, random full range left-right
      this.div.style[randomInt(0, 1) ? 'top' : 'bottom'] = '0';
      this.div.style.left = randomInt(0, window.innerWidth) + 'px';
    } else {
      // just off left or right, random full range top-bottom
      this.div.style[randomInt(1, 1) ? 'left' : 'right'] = '0';
      this.div.style.top = randomInt(0, window.innerHeight) + 'px';
    }
    document.querySelector('main').append(this.div);
  }

  fly() {
    if (parseInt(this.div.style.left) <= (window.innerWidth - 32)) {
      this.div.style.left = `${parseInt(this.div.style.left) + 2}px`
    } else {
      game.activeWordShips.splice(game.activeWordShips.indexOf(this), 1);
      this.div.parentElement.removeChild(this.div);
    }
    
  }
}


