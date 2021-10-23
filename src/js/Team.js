import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import { generateTeam } from './Service/generators';

export default class Team {
  constructor(hero) {
    this.whoIsIt = 'player';
    this.members = [];
    this.allowedTypes = [];
    for (let index = 0; index < hero.length; index += 1) {
      switch (hero[index]) {
        case 'swordsman':
          this.allowedTypes.push(new Swordsman(1));
          break;
        case 'magician':
          this.allowedTypes.push(new Magician(1));
          break;
        case 'bowman':
          this.allowedTypes.push(new Bowman(1));
          break;
        case 'daemon':
          this.allowedTypes.push(new Daemon(1));
          this.whoIsIt = 'comp';
          break;
        case 'undead':
          this.allowedTypes.push(new Undead(1));
          this.whoIsIt = 'comp';
          break;
        case 'vampire':
          this.allowedTypes.push(new Vampire(1));
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
    const startPosition = this.whoIsIt === 'player' ? [1, 2] : [6, 7];
    this.position = this.generateStartPosition(startPosition);
  }

  generateStartPosition() {

  }
}
