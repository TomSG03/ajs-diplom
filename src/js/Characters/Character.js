export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (new.target.name === 'Character') {
      throw new Error('Нельзя создавать базовый класс напрямую');
    }
  }

  levelUp() {
    if (this.health === 0) {
      throw new Error('нельзя повысить левел умершего');
    } else {
      this.level += 1;
      this.attack = Math.round(Math.max(this.attack, this.attack * ((80 + this.health) / 100)));
      this.defence = Math.round(Math.max(this.defence, this.defence * ((80 + this.health) / 100)));
      this.health += 80;
      this.health = this.health > 100 ? 100 : this.health;
    }
  }
}
