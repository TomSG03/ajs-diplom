import Character from './Characters/Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this._position = position;
    this.stepRange = [];
    this.attackRange = [];
    this.setActionRange(this.stepRange, this.character.stepRadius);
    this.setActionRange(this.attackRange, this.character.attackRadius);
    console.log(this.stepRange);
  }

  set position(value) {
    this._position = value;
    this.stepRange = this.setActionRange(this.character.stepRadius);
    this.attackRange = this.setActionRange(this.character.attackRadius);
  }

  get position() {
    return this._position;
  }

  setActionRange(radius) {
    const arr = [];
    const center = this._position;
    const stepLine = 8;
    const posInLine = center % stepLine;
    for (let i = 1; i < radius + 1; i += 1) {
      const up = center - stepLine * i;
      const left = center + i;
      const right = center - i;
      const down = center + stepLine * i;

      if (up >= 0) {
        arr.push(up);
      }
      if (left >= 0 && left % stepLine < posInLine) {
        arr.push(up);
      }
    }
    return arr;
  }
}
