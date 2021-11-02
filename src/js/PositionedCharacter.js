import Character from './Characters/Character';

const boardSize = 8;

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.l_position = position;
    this.stepRange = this.setStepRange(this.character.stepRadius);
    this.attackRange = this.setAttackRange(this.character.attackRadius);
  }

  set position(value) {
    this.l_position = value;
    this.stepRange = this.setStepRange(this.character.stepRadius);
    this.attackRange = this.setAttackRange(this.character.attackRadius);
  }

  get position() {
    return this.l_position;
  }

  setStepRange(radius) {
    const arr = [];
    const pos = this.l_position;
    const stepLine = boardSize;
    const row = Math.trunc(pos / stepLine);
    const col = pos % stepLine;

    for (let i = 1; i < radius + 1; i += 1) {
      const up = row - i;
      const left = col - i;
      const right = col + i;
      const down = row + i;

      if (up >= 0) {
        arr.push(pos - stepLine * i);
      }
      if (left >= 0) {
        arr.push(pos - i);
      }
      if (right < stepLine) {
        arr.push(pos + i);
      }
      if (down < stepLine) {
        arr.push(pos + stepLine * i);
      }
      if (up >= 0 && left >= 0) {
        arr.push(pos - stepLine * i - i);
      }
      if (up >= 0 && right < stepLine) {
        arr.push(pos - stepLine * i + i);
      }
      if (down < stepLine && left >= 0) {
        arr.push(pos + stepLine * i - i);
      }
      if (down < stepLine && right < stepLine) {
        arr.push(pos + stepLine * i + i);
      }
    }
    return arr;
  }

  setAttackRange(radius) {
    const arr = [];
    const pos = this.l_position;
    const stepLine = 8;
    const row = Math.trunc(pos / stepLine) - radius;
    const col = (pos % stepLine) - radius;

    const end = radius * 2 + 1;
    for (let i = 0; i < end; i += 1) {
      const x = row + i;
      for (let n = 0; n < end; n += 1) {
        const y = col + n;
        if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
          const cellXY = (x * boardSize) + y;
          arr.push(cellXY);
        }
      }
    }
    return arr;
  }
}
