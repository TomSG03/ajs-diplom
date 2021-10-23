import themes from './Service/themes';
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
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
