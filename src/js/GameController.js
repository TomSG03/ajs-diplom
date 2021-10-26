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
    this.compTeam = new Team(['daemon', 'undead', 'vampire']);

    this.gamePlay.redrawPositions([...this.plaerTeam.positioned, ...this.compTeam.positioned]);

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
          ...this.compTeam.positioned]);
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
        alert('Атака!!!');
        this.status = '';
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

    const allPositon = [...this.plaerTeam.positioned, ...this.compTeam.positioned];
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

    if (this.selectedMember.stepRange.includes(index)) {
      rezult.cursor = cursors.pointer;
      rezult.color = 'green';
      this.status = 'move';
    }
    if (this.checkMy(index)) {
      rezult.cursor = cursors.auto;
      rezult.color = 'yellow';
      this.status = 'select';
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
    for (let i = 0; i < this.compTeam.positioned.length; i += 1) {
      if (index === this.compTeam.positioned[i].position) {
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
}
