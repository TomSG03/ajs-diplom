export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    console.log(new.target.name);
  }

  levelUp() {
    if (this.health === 0) {
      throw new Error('нельзя повысить левел умершего');
    } else {
      this.level += 1;
      this.health = 100;
      this.attack += (this.attack / 100) * 20;
      this.defence += (this.defence / 100) * 20;
    }
  }
}
