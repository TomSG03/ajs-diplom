import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../Characters/Bowman';

test('character information', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.positioned.push(new PositionedCharacter(new Bowman(2), 20));
  gameCtrl.onCellEnter(20);

  expect(gamePlay.cells[20].title).toBe('🎖2 ⚔25 🛡25 ❤50');

  gameCtrl.onCellEnter(21);
  expect(gamePlay.cells[11].title).toBe('');
});
