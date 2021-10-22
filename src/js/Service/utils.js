export function calcTileType(index, boardSize) {
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  } 
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  } 
  if (index === boardSize * boardSize - boardSize) {
    return 'bottom-left';
  } 
  if (index > 0 && index < boardSize) {
    return 'top';
  } 
  if ((index + 1) % boardSize === 0) {
    return 'right';
  } 
  if ((index + 1) % boardSize === 1) {
    return 'left';
  } 
  if ((index + 1 > boardSize * boardSize - boardSize) && (index < boardSize * boardSize)) {
    return 'bottom';
  } 
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
