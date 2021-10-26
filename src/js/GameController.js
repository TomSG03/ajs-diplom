import themes from './Service/themes';
import cursors from './Service/cursors';
import Team from './Team';
// import GameState from './GameState';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.status = '';
    this.selectedMember = undefined;
    this.indexSelectedMember = undefined;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    // Отключение контекстного меню в браузере
    document.addEventListener('contextmenu', (event) => event.preventDefault());

    this.gamePlay.drawUi(themes.prairie);
    this.plaerTeam = new Team(['swordsman', 'bowman']);
    this.enemyTeam = new Team(['daemon', 'undead', 'vampire']);

    this.gamePlay.redrawPositions([...this.plaerTeam.positioned, ...this.enemyTeam.positioned]);

    this.addEventListener();
  }

  addEventListener() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellClick(index) {
    switch (this.status) {
      case 'select':
        if (this.indexSelectedMember !== undefined) {
          this.gamePlay.deselectCell(this.indexSelectedMember);
        }
        this.gamePlay.selectCell(index);
        this.indexSelectedMember = index;
        this.selectedMember = this.plaerTeam.positioned.find((member) => member.position === index);
        this.status = '';
        break;
      case 'move':
        this.selectedMember.position = index;
        this.gamePlay.deselectCell(this.indexSelectedMember);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions([...this.plaerTeam.positioned,
          ...this.enemyTeam.positioned]);
        this.selectedMember = undefined;
        this.status = '';
        this.onCellEnter(index);
        break;
      case 'ban':
        alert('Не получится!!!');
        this.status = '';
        break;
      case 'ban-attack':
        alert('Слишком далеко!!!');
        this.status = '';
        break;
      case 'enemy':
        alert('Это враг!!!');
        this.status = '';
        break;
      case 'attack':
        console.log(`Атака !!! с ${this.indexSelectedMember} на ${index}`);
        this.status = '';
        this.getAttack(this.indexSelectedMember, index);
        break;

      default:
        break;
    }
  }

  onCellEnter(index) {
    if (this.selectedMember !== undefined) {
      const cellAction = this.getCellAction(index);
      if (this.status !== '') {
        this.setCell(index, cellAction);
      }
    } else {
      const cellAction = this.getCellStatus(index);
      if (this.status !== '') {
        this.setCell(index, cellAction);
      }
    }
  }

  getCellStatus(index) {
    const rezult = {};

    const allPositon = [...this.plaerTeam.positioned, ...this.enemyTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);

    if (findMember !== undefined) {
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${findMember.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.checkMy(index)) {
      rezult.cursor = cursors.auto;
      rezult.color = 'green';
      this.status = 'select';
    }
    if (this.checkEnemy(index)) {
      rezult.cursor = cursors.auto;
      rezult.color = 'red';
      this.status = 'enemy';
    }

    return rezult;
  }

  getCellAction(index) {
    const rezult = {};

    if (this.checkMy(index)) {
      rezult.cursor = cursors.auto;
      rezult.color = 'yellow';
      this.status = 'select';
    }
    if (this.selectedMember.stepRange.includes(index)) {
      rezult.cursor = cursors.pointer;
      rezult.color = 'green';
      this.status = 'move';
    }
    if (this.checkEnemy(index) && this.selectedMember.attackRange.includes(index)) {
      rezult.cursor = cursors.crosshair;
      rezult.color = 'red';
      this.status = 'attack';
    }
    if (!this.selectedMember.stepRange.includes(index) && !this.checkMy(index)) {
      rezult.cursor = cursors.notallowed;
      delete rezult.color;
      this.status = 'ban';
    }
    if (this.checkEnemy(index) && !this.selectedMember.attackRange.includes(index)) {
      rezult.cursor = cursors.notallowed;
      delete rezult.color;
      this.status = 'ban-attack';
    }

    return rezult;
  }

  setCell(index, action) {
    this.gamePlay.setCursor(action.cursor);
    if (action.color) {
      this.gamePlay.selectCell(index, action.color);
    }
  }

  checkEnemy(index) {
    for (let i = 0; i < this.enemyTeam.positioned.length; i += 1) {
      if (index === this.enemyTeam.positioned[i].position) {
        return true;
      }
    }
    return false;
  }

  checkMy(index) {
    for (let i = 0; i < this.plaerTeam.positioned.length; i += 1) {
      if (index === this.plaerTeam.positioned[i].position) {
        return true;
      }
    }
    return false;
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    if (this.indexSelectedMember !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.status = '';
  }

  getAttack(indexMember, indexAttack) {
    const promise = this.attack(indexMember, indexAttack);
    promise.then(() => this.nextTurn(indexAttack));
  }

  attack(index, attackIndex) {
    return new Promise((resolve) => {
      const allPositon = [...this.plaerTeam.positioned, ...this.enemyTeam.positioned];
      const hanter = allPositon.find((member) => member.position === index);
      const death = allPositon.find((member) => member.position === attackIndex);
      const damage = Math.max(hanter.character.attack - death.character.defence,
        hanter.character.attack * 0.1);

      const promise = this.gamePlay.showDamage(attackIndex, damage);
      promise.then(() => {
        death.character.health -= damage;
        if (death.character.health <= 0) {
          if (this.enemyTeam.positioned.includes(death)) {
            this.enemyTeam.positioned.splice(this.enemyTeam.positioned.indexOf(death), 1);
          } else {
            this.playerTeam.positioned.splice(this.playerTeam.positioned.indexOf(hanter), 1);
          }
        }
        resolve();
      });
    });
  }

  nextTurn(indexAttack) {
    const allPositon = [...this.plaerTeam.positioned, ...this.enemyTeam.positioned];
    this.gamePlay.redrawPositions(allPositon);
  }
}
