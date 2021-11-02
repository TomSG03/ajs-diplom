import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../Characters/Bowman';
import Swordsman from '../Characters/Swordsman';
import Vampire from '../Characters/Vampire';

// такие тесты работеют с Jest версии 25.
// и НЕ РАБОТАЮТ с версией 27
test('character information', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.innerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 20));
  gameCtrl.onCellEnter(20);
  expect(gamePlay.cells[20].title).toBe('\u{1F396}2 ⚔25 \u{1F6E1}25 ❤50');
});

test('choosing another character', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.innerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 20));
  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Swordsman(1), 54));
  gameCtrl.status = 'select';
  gameCtrl.onCellClick(20);
  gameCtrl.onCellEnter(54);

  expect([...gamePlay.cells[20].classList]).toEqual(expect.arrayContaining(['selected-yellow']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('choosing cell', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.innerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 20));
  gameCtrl.status = 'select';
  gameCtrl.onCellClick(20);
  gameCtrl.onCellEnter(21);

  expect([...gamePlay.cells[21].classList]).toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('choosing enemy', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.innerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 20));
  gameCtrl.enemyTeam.positioned.push(new PositionedCharacter(new Vampire(2), 21));
  gameCtrl.status = 'select';
  gameCtrl.onCellClick(20);
  gameCtrl.onCellEnter(21);

  expect([...gamePlay.cells[21].classList]).toEqual(expect.arrayContaining(['selected-red']));
  expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
});

test('out of access', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.innerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 10));
  gameCtrl.status = 'select';
  gameCtrl.onCellClick(10);
  gameCtrl.onCellEnter(56);

  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
});
