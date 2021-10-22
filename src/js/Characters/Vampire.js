import Character from './Character';

export default class Vampire extends Character {
  constructor(name) {
    super(name, 'Vampire');
    this.attack = 40;
    this.defence = 10;

    this.attackRadius = 2;
    this.stepRadius = 2;
  }
}
