import themes from './Service/themes';
import cursors from './Service/cursors';
import Team, { plaerStartLine, enemyStartLine } from './Team';
import GameState from './GameState';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // Отключение контекстного меню в браузере
    // document.addEventListener('contextmenu', (event) => event.preventDefault());

    this.gamePlay.drawUi(themes[0]);

    this.playerTeam = new Team(['swordsman', 'bowman']);
    // this.playerTeam.whoIsIt = 'player';
    this.playerTeam.startLine = plaerStartLine.slice();
    this.playerTeam.init();

    this.enemyTeam = new Team(['daemon', 'undead', 'vampire']);
    this.enemyTeam.startLine = enemyStartLine.slice();
    this.enemyTeam.init();

    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);

    const scoreMax = this.state !== undefined ? this.state.scoreMax : 0;
    // player, level, score, scoreMax, playerTeam, enemyTeam
    this.state = new GameState(true, 1, 0, scoreMax,
      this.playerTeam.positioned, this.enemyTeam.positioned);
    this.gamePlay.upScoreMax(`Best score: ${this.state.scoreMax}`);
    this.status = '';
    this.selectedMember = undefined;

    this.state.step = 0;

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
    this.disableBoard();
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];

    this.status = '';
    this.state.step = 0;

    this.selectedMember = undefined;

    delete this.playerTeam;
    delete this.enemyTeam;

    this.init();
  }

  onLoadGame() {
    try {
      this.state.from(this.stateService.load());
    } catch (e) {
      GamePlay.showError(e.message);
    }

    this.playerTeam.positioned = this.state.playerTeam;
    this.enemyTeam.positioned = this.state.enemyTeam;

    this.gamePlay.drawUi(themes[this.state.level - 1]);
    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
    this.gamePlay.upScore(`Score: ${this.state.score}`);
    this.gamePlay.upScoreMax(`Best score: ${this.state.scoreMax}`);
    this.gamePlay.upLevel(`Level: ${this.state.level}`);
  }

  onSaveGame() {
    this.state.playerTeam = this.playerTeam.positioned;
    this.state.enemyTeam = this.enemyTeam.positioned;
    this.stateService.save(this.state);
    GamePlay.showMessage('Игра сохранена!');
  }

  // при клике на ячейку совершается действие
  // которое было выбрано при наведении курсора мыши на ячейку
  onCellClick(index) {
    switch (this.status) {
      case 'select': // выбор персонажа
        this.selectedMember = this.playerTeam.positioned.find(
          (member) => member.position === index,
        );
        this.gamePlay.selectCell(this.selectedMember.position);
        this.status = '';
        break;
      case 'move': // перемещение персонажа
        this.gamePlay.deselectCell(this.selectedMember.position);
        this.selectedMember.position = index;
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
        this.status = 'attack';
        this.getAttack(this.selectedMember.position, index);
        break;

      default:
        break;
    }
  }

  onCellEnter(index) {
    // this.gamePlay.showCellTooltip(`${index} : ${Math.trunc(index / 8)} : ${index % 8}`, index);
    const allPositon = [...this.playerTeam.positioned, ...this.enemyTeam.positioned];
    const findMember = allPositon.find((member) => member.position === index);

    if (findMember !== undefined) {
      const message = `🎖${findMember.character.level} ⚔${findMember.character.attack} 🛡${findMember.character.defence} ❤${(findMember.character.health).toFixed()}`;
      this.gamePlay.showCellTooltip(message, index);
    }
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

  // выбираем возможные действия если на поле. Еще никто не выбран
  getCellStatus(index) {
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

    if (this.selectedMember === undefined) {
      this.gamePlay.deselectCell(index);
    } else if (this.selectedMember.position !== index) {
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

      const promise = this.gamePlay.showDamage(attackIndex, damage.toFixed());
      promise.then(() => {
        death.character.health -= damage;

        if (death.character.health <= 0) {
          if (this.enemyTeam.positioned.includes(death)) {
            this.enemyTeam.positioned.splice(this.enemyTeam.positioned.indexOf(death), 1);
          } else {
            this.playerTeam.positioned.splice(this.playerTeam.positioned.indexOf(death), 1);
          }
          this.selectedMember = undefined;
          this.status = '';
        }
        this.state.toGo = !this.state.toGo;
        resolve();
      });
    });
  }

  nextTurn(index = 0) {
    const allPositon = [...this.playerTeam.positioned, ...this.enemyTeam.positioned];
    this.gamePlay.redrawPositions(allPositon);
    this.gamePlay.deselectCell(index);
    this.selectedMember = undefined;

    if (this.playerTeam.positioned.length === 0) {
      GamePlay.showMessage('Поражение!!!');
      this.disableBoard();
    }
    if (this.enemyTeam.positioned.length === 0) {
      if (this.state.level === 4) {
        GamePlay.showMessage('Победа!!! Игра пройдена');
        this.state.toGo = true;
        this.nextGame();
      } else {
        GamePlay.showMessage('Победа!!! Уровень пройден');
        this.state.toGo = true;
        this.nextLevel();
      }
    }
    if (!this.state.toGo) {
      this.enemyAttack(index);
    }
  }

  nextGame() {
    this.playerTeam.positioned.forEach((element) => {
      this.state.score += element.character.health;
    });
    if (this.state.score > this.state.scoreMax) {
      this.state.scoreMax = this.state.score;
    }
    this.disableBoard();
  }

  disableBoard() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.setCursor(cursors.auto);
  }

  nextLevel() {
    this.state.level += 1;
    this.playerTeam.levelUps();
    this.state.step = 0;

    const count = this.state.level > 2 ? 2 : 1;

    this.playerTeam.addMembers(count, this.state.level - 1);
    this.playerTeam.positioned.forEach((element) => {
      this.playerTeam.members.push(element.character);
      this.state.score += element.character.health;
    });
    if (this.state.score > this.state.scoreMax) {
      this.state.scoreMax = this.state.score;
    }

    this.gamePlay.drawUi(themes[this.state.level - 1]);
    this.gamePlay.upLevel(`Level: ${this.state.level}`);
    this.gamePlay.upScore(`Score: ${this.state.score}`);
    this.gamePlay.upScoreMax(`Best score: ${this.state.scoreMax}`);

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
    const memAttack = this.enemyTeam.positioned.find((member) => member.position === index);
    if (memAttack !== undefined) { // если нашелся, то атакуем им в первую очередь
      this.selectedMember = memAttack;
      const indexAttack = this.findPlayerTeam();
      if (indexAttack !== undefined) {
        this.getAttack(index, indexAttack);
      }
    } else { // ищем у какого персонажа есть в диапазоне атаки персонаж игрока
      const attackRange = this.attackRange();
      if (attackRange.member !== undefined) { // если нашелся, то атакуем
        this.selectedMember = attackRange.member;
        this.getAttack(attackRange.index, attackRange.indexAttack);
      } else { // если не кого атаковать делаем передвижение
        this.move(this.playerTeam.positioned);
        this.state.toGo = true;
        this.nextTurn();
      }
    }
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

  move(playerPositioned) {
    const boardSize = 8;
    const distances = [];

    // array of possible steps for all chars in enemy team
    this.enemyTeam.positioned.forEach((member) => {
      playerPositioned.forEach((character) => {
        distances.push({
          member,
          targetIndex: character.position,
          distance: GameController.calcSteps(member, character, boardSize),
        });
      });
    });

    // sort by shortest distance or by attack power if distance is equal
    distances.sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      // if distance equal
      if (a.member.character.attack > b.member.character.attack) return -1;
      if (a.member.character.attack < b.member.character.attack) return 1;
      return 0;
    });

    // calc the best move to target char
    const bestMove = GameController.bestMove(distances[0].member,
      distances[0].targetIndex, boardSize);
    for (let i = 0; i < bestMove.length; i += 1) {
      // if there`s no char at the end of path then move or try next best move
      if ([...playerPositioned, ...this.enemyTeam.positioned]
        .findIndex((character) => character.position === bestMove[i].stepIndex) < 0) {
        distances[0].member.position = bestMove[i].stepIndex;
        break;
      }
    }
  }

  static calcSteps(index, target, boardSize) {
    // calc the difference between vertical and horizontal lines for target
    const vertical = Math.abs(
      Math.floor(index.position / boardSize) - Math.floor(target.position / boardSize),
    );
    const horizontal = Math.abs(
      Math.floor(index.position % boardSize) - Math.floor(target.position % boardSize),
    );
    // calc count of steps to enter in attack radius
    const vertSteps = Math.ceil(
      (vertical - index.character.attackRadius) / index.character.stepRadius,
    );
    const horSteps = Math.ceil(
      (horizontal - index.character.attackRadius) / index.character.stepRadius,
    );
    // considering diagonal
    if (vertSteps < horSteps) {
      return horSteps > 0 ? horSteps : 0;
    }
    return vertSteps > 0 ? vertSteps : 0;
  }

  static bestMove(index, target, boardSize) {
    // количество шагов до цели
    const bestStep = [];
    index.stepRange.forEach((stepIndex) => {
      const vertical = Math.abs(
        Math.floor(stepIndex / boardSize) - Math.floor(target / boardSize),
      );
      const horizontal = Math.abs(
        Math.floor(stepIndex % boardSize) - Math.floor(target % boardSize),
      );
      bestStep.push({ stepIndex, result: vertical + horizontal - index.character.attackRadius });
    });
    return bestStep.sort((a, b) => a.result - b.result);
  }
}
