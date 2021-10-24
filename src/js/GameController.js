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
      GameState.selectedMember.position = index;
      this.gamePlay.deselectCell(GameState.indexSelectedMember);
      this.gamePlay.redrawPositions([...this.plaerTeam.positioned, ...this.compTeam.positioned]);
    }
  }

  onCellEnter(index) {
    const allPositon = [...this.plaerTeam.positioned, ...this.compTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);
    if (findMember !== undefined) {
      this.gamePlay.setCursor(cursors.pointer);
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${findMember.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    if (GameState.selectedMember !== undefined) {
      this.gamePlay.showCellTooltip(index, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }
}
