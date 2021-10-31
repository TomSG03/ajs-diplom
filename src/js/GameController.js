import themes from './Service/themes';
import cursors from './Service/cursors';
import Team, { plaerStartLine, enemyStartLine } from './Team';
import GameState from './GameState';
import GamePlay from './GamePlay';
// import { find } from 'core-js/core/array';
// import GameStateService from './GameStateService';
// import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    // Отключение контекстного меню в браузере
    // document.addEventListener('contextmenu', (event) => event.preventDefault());

    this.gamePlay.drawUi(themes.prairie);

    this.playerTeam = new Team(['swordsman', 'bowman']);
    // this.playerTeam.whoIsIt = 'player';
    this.playerTeam.startLine = plaerStartLine.slice();
    this.playerTeam.init();

    this.enemyTeam = new Team(['daemon', 'undead', 'vampire']);
    this.enemyTeam.startLine = enemyStartLine.slice();
    this.enemyTeam.init();

    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);

    // player, level, score, scoreMax, playerTeam, enemyTeam
    this.state = new GameState(true, 1, 0, 0,
      this.playerTeam.positioned, this.enemyTeam.positioned);

    this.status = '';
    this.selectedMember = undefined;
    this.indexSelectedMember = undefined;

    this.addEventListener();
  }

  addEventListener() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  onNewGame() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];

    this.status = '';

    this.selectedMember = undefined;
    this.indexSelectedMember = undefined;

    delete this.playerTeam;
    delete this.enemyTeam;

    this.init();
  }

  onLoadGame() {
    const state = this.stateService.load();
    console.log(state.playerTeam);
    console.log(state.enemyTeam);
  }

  onSaveGame() {
    this.state.playerTeam = this.playerTeam.positioned;
    this.state.enemyTeam = this.enemyTeam.positioned;
    // this.state.selectedMember = this.selectedMember;
    // this.state.indexSelectedMember = this.indexSelectedMember;
    this.stateService.save(this.state);
  }

  // при клике на ячейку совершается действие
  // которое было выбрано при наведении курсора мыши на ячейку
  onCellClick(index) {
    switch (this.status) {
      case 'select': // выбор персонажа
        if (this.indexSelectedMember !== undefined) {
          this.gamePlay.deselectCell(this.indexSelectedMember);
        }
        this.gamePlay.selectCell(index);
        this.indexSelectedMember = index;
        this.selectedMember = this.playerTeam.positioned.find(
          (member) => member.position === index,
        );
        this.status = '';
        break;
      case 'move': // перемещение персонажа
        this.selectedMember.position = index;
        this.gamePlay.deselectCell(this.indexSelectedMember);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions([...this.playerTeam.positioned,
          ...this.enemyTeam.positioned]);
        this.selectedMember = undefined;
        this.status = '';
        this.state.toGo = false;
        this.onCellEnter(index);
        this.nextTurn(index);
        break;
      case 'ban': // попытка переместить персонаж за возможные пределы
        GamePlay.showMessage('Не получится!!!');
        this.status = '';
        break;
      case 'ban-attack': // попытка произвести атаку когда дойти можно а атокавать нельзя
        GamePlay.showMessage('Слишком далеко!!!');
        this.status = '';
        break;
      case 'enemy': // попытка выбрать персонаж из команды противника
        GamePlay.showMessage('Это враг!!!');
        this.status = '';
        break;
      case 'attack': // атака противника
        console.log(`Атака !!! с ${this.indexSelectedMember} на ${index}`);
        this.status = 'attack';
        // this.state.toGo = false;
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

  // выбираем возможные действия если на поле еще никто не выбран
  getCellStatus(index) {
    const allPositon = [...this.playerTeam.positioned, ...this.enemyTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);

    if (findMember !== undefined) {
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${findMember.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.checkPlayer(index)) {
      this.status = 'select';
      return { cursor: cursors.auto, color: 'green' };
    }
    if (this.checkEnemy(index)) {
      this.status = 'enemy';
      return { cursor: cursors.auto, color: 'red' };
    }

    return {};
  }

  // выбираем возможные действия если на поле выбран персонаж
  getCellAction(index) {
    if (this.checkPlayer(index)) {
      this.status = 'select';
      return { cursor: cursors.auto, color: 'yellow' };
    }
    if (this.selectedMember.stepRange.includes(index) && !this.checkEnemy(index)) {
      this.status = 'move';
      return { cursor: cursors.pointer, color: 'green' };
    }
    if (this.checkEnemy(index) && this.selectedMember.attackRange.includes(index)) {
      this.status = 'attack';
      return { cursor: cursors.crosshair, color: 'red' };
    }
    if (!this.selectedMember.stepRange.includes(index) && !this.checkPlayer(index)) {
      this.status = 'ban';
      return { cursor: cursors.notallowed };
    }
    if (this.checkEnemy(index) && !this.selectedMember.attackRange.includes(index)) {
      this.status = 'ban-attack';
      return { cursor: cursors.notallowed };
    }

    return {};
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

  checkPlayer(index) {
    for (let i = 0; i < this.playerTeam.positioned.length; i += 1) {
      if (index === this.playerTeam.positioned[i].position) {
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
      const allPositon = [...this.playerTeam.positioned, ...this.enemyTeam.positioned];
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
            this.playerTeam.positioned.splice(this.playerTeam.positioned.indexOf(death), 1);
          }
        }
        this.state.toGo = !this.state.toGo;
        resolve();
      });
    });
  }

  nextTurn(index) {
    const allPositon = [...this.playerTeam.positioned, ...this.enemyTeam.positioned];
    this.gamePlay.redrawPositions(allPositon);
    this.gamePlay.deselectCell(index);
    this.gamePlay.deselectCell(this.indexSelectedMember);
    this.selectedMember = undefined;
    this.indexSelectedMember = undefined;

    if (this.playerTeam.positioned.length === 0) {
      GamePlay.showMessage('Вы проиграли!!');
      this.onNewGame();
    }
    if (this.enemyTeam.positioned.length === 0) {
      GamePlay.showMessage('Вы победили!!');
      this.nextLevel();
    }
    if (!this.state.toGo) {
      this.enemyAttack(index);
    }
  }

  nextLevel() {
    this.state.level += 1;
    this.gamePlay.level.textContent = `Level: ${this.state.level}`;
    this.playerTeam.levelUps();

    const count = this.state.level > 2 ? 2 : 1;

    this.playerTeam.addMembers(count, this.state.level - 1);
    this.playerTeam.positioned.forEach((element) => {
      this.playerTeam.members.push(element.character);
    });
    this.playerTeam.startLine = plaerStartLine.slice();
    this.playerTeam.generateStartPosition(this.playerTeam.members.length);

    delete this.enemyTeam;

    this.enemyTeam = new Team(['daemon', 'undead', 'vampire']);
    this.enemyTeam.startLine = enemyStartLine.slice();
    this.enemyTeam.init(this.state.level, this.playerTeam.members.length);

    this.gamePlay.redrawPositions([...this.playerTeam.positioned,
      ...this.enemyTeam.positioned]);
  }

  enemyAttack(index) {
    // находим персонаж которого атаковали
    let memAttack = this.enemyTeam.positioned.find((member) => member.position === index);
    if (memAttack !== undefined) { // если нашелся, то атакуем им в первую очередь
      this.selectedMember = memAttack;
      this.indexSelectedMember = index;
      const indexAttack = this.findPlayerTeam();
      if (indexAttack !== undefined) {
        // this.state.toGo = true;
        this.getAttack(this.indexSelectedMember, indexAttack);
      }
    } else { // ищем у какого персонажа есть в диапазоне атаки персонаж игрока
      memAttack = this.attackRange();
      if (memAttack.member) {
        this.selectedMember = memAttack.member;
        this.indexSelectedMember = memAttack.index;
        // this.state.toGo = true;
        this.getAttack(this.indexSelectedMember, memAttack.indexAttack);
      } else { // ищем у какого персонажа есть в диапазоне шага персонаж игрока
        const memStep = this.stepRange();
        if (memStep.index >= 0) {
          this.selectedMember = this.enemyTeam.positioned[memStep.index];
          this.moveEnemy(this.findPos());
          // this.state.toGo = true;
        } else {
          console.log('Нужнo искать противника');
        }
      }
    }
  }

  // Поиск среди всех персонажей противника у которых в диапазоне шага есть персонажи игрока
  stepRange() {
    for (let index = 0; index < this.enemyTeam.positioned.length; index += 1) {
      const member = this.enemyTeam.positioned[index];
      for (let n = 0; n < this.playerTeam.positioned.length; n += 1) {
        const indexAttack = this.playerTeam.positioned[n].position;
        if (member.stepRange.includes(indexAttack)) {
          return { index };
        }
      }
    }
    return {};
  }

  findPos() {
  //   for (let index = 0; index < 8; index += 1) {
  //     const element = array[index];
  //   }
  }

  // Поиск среди всех персонажей противника у которых в диапазоне атаки есть персонажи игрока
  attackRange() {
    for (let i = 0; i < this.enemyTeam.positioned.length; i += 1) {
      const member = this.enemyTeam.positioned[i];
      const index = this.enemyTeam.positioned[i].position;
      for (let n = 0; n < this.playerTeam.positioned.length; n += 1) {
        const indexAttack = this.playerTeam.positioned[n].position;
        if (member.attackRange.includes(indexAttack)) {
          return { member, index, indexAttack };
        }
      }
    }
    return {};
  }

  // Поиск возле атакованного
  findPlayerTeam() {
    for (let i = 0; i < this.playerTeam.positioned.length; i += 1) {
      if (this.selectedMember.attackRange.includes(this.playerTeam.positioned[i].position)) {
        return this.playerTeam.positioned[i].position;
      }
    }
    return undefined;
  }

  // перемещение персонажа противника
  moveEnemy(newIndex) {
    this.selectedMember.position = newIndex;
    this.gamePlay.redrawPositions([...this.playerTeam.positioned,
      ...this.enemyTeam.positioned]);
  }
}
