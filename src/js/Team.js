import Bowerman from './Bowerman';
import Daemon from './Daemon';
import Zombie from './Zombie';

export default class Team {
  constructor() {
    this.members = new Set();
    this.init();
  }

  init() {
    const personBowerman = new Bowerman('Jack');
    const personDaemon = new Daemon('London');
    const personZombie = new Zombie('Victor');
  }

  add(person) {
    if (this.members.has(person)) {
      throw new Error('Такой персонаж уже выбран');
    }
    this.members.add(person);
  }

  addAll(...person) {
    person.forEach((element) => {
      this.members.add(element);
    });
  }

  toArray() {
    return [...this.members];
  }

}