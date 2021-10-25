import themes from './Service/themes';
import cursors from './Service/cursors';
import Team from './Team';
import GameState from './GameState';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
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
    const allPositon = [...this.plaerTeam.positioned, ...this.compTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);
    if (findMember !== undefined) {
      const plaerMember = this.plaerTeam.members.find((member) => findMember.character === member);
      if (plaerMember !== undefined) {
        if (GameState.indexSelectedMember !== index) {
          if (GameState.indexSelectedMember !== undefined) {
            this.gamePlay.deselectCell(GameState.indexSelectedMember);
          }
          this.gamePlay.selectCell(index);
          GameState.indexSelectedMember = index;
          GameState.selectedMember = findMember;
        }
      } else {
        GamePlay.showError('Это чужая команда!!!');
      }
    } else if (GameState.selectedMember !== undefined) {
      if (GameState.selectedMember.stepRange.includes(index)) {
        GameState.selectedMember.position = index;
        this.gamePlay.deselectCell(GameState.indexSelectedMember);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions([...this.plaerTeam.positioned, ...this.compTeam.positioned]);
        GameState.selectedMember = undefined;
      } else {
        alert('Не получится!!!');
      }
    }
  }

  onCellEnter(index) {
    const allPositon = [...this.plaerTeam.positioned, ...this.compTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);
    if (findMember !== undefined) {
      this.gamePlay.setCursor(cursors.pointer);
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${findMember.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    } else if (GameState.selectedMember !== undefined) {
      if (GameState.selectedMember.stepRange.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
        if (this.checkEnemy(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        }
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
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

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    if (GameState.indexSelectedMember !== index) {
      this.gamePlay.deselectCell(index);
    }
  }
}
