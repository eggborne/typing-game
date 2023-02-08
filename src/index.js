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
  console.log(game.dictionary);
  game.createEgg();
  game.loop();
});

class Game {
  constructor() {
    this.activeWordShips = [];
    this.tickCount = 0;
    this.over = false;
    this.dictionary = { 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
    this.launchFrequency = 150;
    this.focusedShips = [];
    this.playerInput = '';
    window.addEventListener('keydown', async (e) => {
      if ('abcdefghijklmnopqrstuvwxyz'.includes(e.key)) {
        this.playerInput += e.key;
        if (this.focusedShips.length) {
          console.log(this.focusedShips);
          for (const ship of this.focusedShips) {
            if (this.matchesSoFar(this.playerInput, ship.word)) {
              console.log(this.playerInput, 'matches', ship.word, 'so far');
              ship.focusLayer.innerText = this.playerInput;
              if (ship.word === this.playerInput) {
                document.getElementById('input-display').innerText = this.playerInput;
                document.getElementById('input-display').classList.add('correct');
                await ship.destroy();
                document.getElementById('input-display').classList.remove('correct');
              }
            } else {
              this.focusOnShip(ship, true);
              if (this.focusedShips.length === 0) {
                document.getElementById('input-display').classList.add('dying');
                await pause(300);
                document.getElementById('input-display').classList.remove('dying');
              }
            }
          }
        } else {
          this.searchWordShipsForFirstLetter(e.key);
        }
        if (this.focusedShips.length === 0) {
          
          this.playerInput = '';
        }
        document.getElementById('input-display').innerText = this.playerInput;
      }
    });

    document.body.classList.remove('over');
  }

  async fillDictionary() {
    for (let i = 3; i <= 10; i++) {
      let words = await sendQuery(`https://api.datamuse.com/words?sp=${'?'.repeat(i)}`);
      this.dictionary[i].push(...words);
    }
  }

  matchesSoFar(shortString, longString) {
    let matches = true;
    for (const index in shortString) {
      if (longString[index] !== shortString[index]) {
        matches = false;
      }
    }
    return matches;
  }

  searchWordShipsForFirstLetter(letter) {
    console.log(this.activeWordShips);
    let wordArray = [];
    for (const ship of this.activeWordShips) {
      if (ship.word[0] === letter) {
        this.focusOnShip(ship);
      } else {
        ship.div.classList.remove('highlighted');
      }
    }

    console.log('searching words', wordArray);
  }

  createEgg() {
    this.egg = new Egg();
  }

  focusOnShip(ship, remove) {
    if (!remove) {
      ship.div.classList.add('highlighted');
      ship.focusLayer.innerText = this.playerInput;
      this.focusedShips.push(ship);
    } else {
      ship.div.classList.remove('highlighted');
      this.focusedShips.splice(this.focusedShips.indexOf(ship), 1);
    }
  }

  async launchWordShip() {
    let randomLengthArray = this.dictionary[randomInt(3, 10)];
    let randomWordIndex = randomInt(0, randomLengthArray.length - 1);
    let word = randomLengthArray[randomWordIndex].word;
    let newShip = new WordShip(word);
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
    this.focusLayer = document.createElement('div');
    this.focusLayer.classList.add('focus-layer');
    this.div.classList.add('word-ship');
    this.div.id = `${this.word}-ship`;
    this.div.innerText = word;
    this.div.append(this.focusLayer);
    if (randomInt(0, 0)) { // just off top or bottom, random full range left-right
      this.div.style[randomInt(0, 1) ? 'top' : 'bottom'] = '0';
      this.div.style.left = randomInt(0, window.innerWidth) + 'px';
    } else { // just off left or right, random full range top-bottom
      this.div.style[randomInt(1, 1) ? 'left' : 'right'] = '0';
      this.div.style.top = randomInt(64, window.innerHeight-64) + 'px';
    }
    document.querySelector('main').append(this.div);
  }

  fly() {
    if (parseInt(this.div.style.left) <= window.innerWidth) {
      this.div.style.left = `${parseInt(this.div.style.left) + 2}px`;
    } else {
      this.destroy(true);
      
    }
  }

  async destroy(skipAnimation) {
    if (!skipAnimation) {
      this.div.classList.add('defeated');
      await pause(300);
    }
    if (game.focusedShips.includes(this)) {
      game.focusedShips.splice(game.focusedShips.indexOf(this), 1);
    }
    game.activeWordShips.splice(game.activeWordShips.indexOf(this), 1);
    this.div.parentElement.removeChild(this.div);
  }
}


