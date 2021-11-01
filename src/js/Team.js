import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

import PositionedCharacter from './PositionedCharacter';

import { generateTeam } from './Service/generators';
import Character from './Characters/Character';

const plaerStartLine = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
const enemyStartLine = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];

export { plaerStartLine, enemyStartLine };

export default class Team {
  constructor(hero) {
    // this.whoIsIt = '';

    this.allowedTypes = [];
    for (let index = 0; index < hero.length; index += 1) {
      switch (hero[index]) {
        case 'swordsman':
          this.allowedTypes.push(new Swordsman());
          break;
        case 'magician':
          this.allowedTypes.push(new Magician());
          break;
        case 'bowman':
          this.allowedTypes.push(new Bowman());
          break;
        case 'daemon':
          this.allowedTypes.push(new Daemon());
          break;
        case 'undead':
          this.allowedTypes.push(new Undead());
          break;
        case 'vampire':
          this.allowedTypes.push(new Vampire());
          break;
        default:
          break;
      }
    }
    this.position = [];
  }

  init(maxLevel = 1, count = 2) {
    this.members = [];
    this.members = generateTeam(this.allowedTypes, maxLevel, count);
    // this.startLine = this.whoIsIt === 'player' ? this.plaerStartLine : this.enemyStartLine;
    this.generateStartPosition(count);
  }

  generateStartPosition(memberCount) {
    this.positioned = [];
    for (let index = 0; index < memberCount; index += 1) {
      const rand = Math.floor(Math.random() * this.startLine.length);
      const position = this.startLine.splice(rand, 1)[0];
      this.positioned.push(new PositionedCharacter(this.members[index], position));
    }
  }

  levelUps() {
    this.positioned.forEach((element) => element.character.levelUp());
  }

  addMembers(maxLevel, count) {
    this.members = [];
    this.allowedTypes = [new Swordsman(), new Magician(), new Bowman()];
    this.members = generateTeam(this.allowedTypes, maxLevel, count);
  }
}
