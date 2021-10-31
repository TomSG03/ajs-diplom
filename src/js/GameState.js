export default class GameState {
  constructor(toGo, level, scope, scopeMax, playerTeam, enemyTeam) {
    this.toGo = toGo;
    this.level = level;
    this.scope = scope;
    this.scopeMax = scopeMax;
    this.playerTeam = playerTeam;
    this.enemyTeam = enemyTeam;
  }
  // static from(object) {
  //   // TODO: create object
  //   return null;
  // }
}
