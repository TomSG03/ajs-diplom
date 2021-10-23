import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

import PositionedCharacter from './PositionedCharacter';

import { generateTeam } from './Service/generators';

const plaerStartLine = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
const compStartLine = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];

export default class Team {
  constructor(hero) {
    this.whoIsIt = 'player';
    this.members = [];
    this.positioned = [];

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
          this.whoIsIt = 'comp';
          break;
        case 'undead':
          this.allowedTypes.push(new Undead());
          this.whoIsIt = 'comp';
          break;
        case 'vampire':
          this.allowedTypes.push(new Vampire());
          this.whoIsIt = 'comp';
          break;
        default:
          break;
      }
    }
    this.position = [];
    this.init();
  }

  init() {
    this.members = generateTeam(this.allowedTypes, 1, 2);
    this.startLine = this.whoIsIt === 'player' ? plaerStartLine : compStartLine;
    this.position = this.generateStartPosition(2);
  }

  generateStartPosition(memberCount) {
    for (let index = 0; index < memberCount; index += 1) {
      const rand = Math.floor(Math.random() * this.startLine.length);
      const position = this.startLine.splice(rand, 1)[0];
      this.positioned.push(new PositionedCharacter(this.members[index], position));
    }
  }
}
