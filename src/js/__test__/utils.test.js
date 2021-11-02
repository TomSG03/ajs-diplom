import { calcTileType } from '../Service/utils';

test.each([
  [0, 'top-left'],
  [4, 'top'],
  [7, 'top-right'],
  [15, 'right'],
  [16, 'left'],
  [20, 'center'],
  [63, 'bottom-right'],
  [56, 'bottom-left'],
  [58, 'bottom'],
])(
  'Check number to return string',
  (number, expected) => {
    expect(calcTileType(number, 8)).toBe(expected);
  },
);
