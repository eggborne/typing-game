import './css/styles.css';
import {
  randomInt,
  pause,
  distanceFromABToXY,
  pointAtAngle,
  angleOfPointABFromXY,
  degToRad,
  radToDeg
} from './util.js'

class Game {
  constructor() {
    this.activeWordShips = [];
  }

  createEgg() {
    this.egg = new Egg();
  }

  launchWordShip() {
    let randomWord = 'chihuahua';
    let newShip = new WordShip(randomWord);
    newShip.goal = {
      x: document.getElementById('egg').clientTop,
      y: document.getElementById('egg').clientLeft,
    }
    this.activeWordShips.push(newShip);
  }
}

class Egg {
  constructor() {
    this.weapons = [];
    this.div = document.createElement('div');
    this.div.id = 'egg';
    this.gun = document.createElement('div');
    this.gun.classList.add('extended')
    this.gun.id = 'egg-gun';
    this.div.append(this.gun);
    document.querySelector('main').append(this.div);
    this.position = {
      x: this.div.offsetLeft,
      y: this.div.offsetTop,
    }
  }

  aimCannon(targetElement) {
    let targX = targetElement.offsetLeft + (targetElement.clientWidth / 2);
    let targY = targetElement.offsetTop + (targetElement.clientHeight / 2);
    console.log('using args', targX, targY, this.position.x, this.position.y)
    let aimAngle = radToDeg(angleOfPointABFromXY(targX, targY, this.position.x, this.position.y));
    console.log('angle away is', aimAngle);
    this.div.style.rotate = `${aimAngle}deg`
  }
}


class WordShip {
  constructor(word) {
    this.word = word
    this.div = document.createElement('div');
    this.div.classList.add('word-ship');
    this.div.id = `${this.word}-ship`;
    this.div.innerText = word;
    if (randomInt(0, 1)) {
      // just off top or bottom, random full range left-right
      this.div.style[randomInt(0,1) ? 'top' : 'bottom'] = '0';
      this.div.style.left = randomInt(0, window.innerWidth) + 'px';
    } else {
      // just off left or right, random full range top-bottom
      this.div.style[randomInt(0,1) ? 'left' : 'right'] = '0';
      this.div.style.top = randomInt(0, window.innerHeight) + 'px';
    }
    document.querySelector('main').append(this.div);
  }

  flyToEgg() {

  }
}

const game = new Game();
game.createEgg();
game.launchWordShip();
game.egg.aimCannon(game.activeWordShips[0].div)

