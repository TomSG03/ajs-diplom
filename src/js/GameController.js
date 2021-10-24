import themes from './Service/themes';
import cursors from './Service/cursors';
import Team from './Team';


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

    console.log(this.plaerTeam.members);
    console.log(this.compTeam.members);

    console.log(this.plaerTeam.positioned);
    console.log(this.compTeam.positioned);

    this.gamePlay.redrawPositions([...this.plaerTeam.positioned, ...this.compTeam.positioned]);

    this.addEventListener();
  }

  addEventListener() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellClick(index) {
  }

  onCellEnter(index) {
    const allPositon = [...this.plaerTeam.positioned, ...this.compTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);
    if (findMember !== undefined) {
      this.gamePlay.setCursor(cursors.pointer);
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${findMember.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }
}
