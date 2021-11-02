import Character from '../Characters/Character';
import Bowman from '../Characters/Bowman';

test('Created Bowman class', () => {
  expect(new Bowman(1)).toEqual({
    type: 'bowman',
    health: 50,
    level: 1,
    attack: 25,
    defence: 25,
    attackRadius: 2,
    stepRadius: 2,
  });
});

test('Created Character class', () => {
  expect(() => new Character(1)).toThrowError(new Error('Нельзя создавать базовый класс напрямую'));
});