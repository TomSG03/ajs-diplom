import Character from './Character';

export default class Bowerman extends Character {
  constructor(name) {
    super(level, 'Bowerman');
    this.attack = 25;
    this.defence = 25;

    this.attackRadius = 2;
    this.stepRadius = 2;
  }
}
