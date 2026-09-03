import { INPUT_BUFFER_WINDOW } from '../config.js';

// Mémorise le dernier input "action" (attaque) du joueur pendant une courte fenêtre,
// pour que l'appui pendant la recovery d'un coup précédent ne soit pas perdu.
export class InputBuffer {
  constructor() {
    this.queue = []; // { action, time }
  }

  push(action) {
    this.queue.push({ action, time: performance.now() });
  }

  // Retourne la plus ancienne action encore valide et la retire du buffer, sinon null
  consume() {
    const now = performance.now();
    while (this.queue.length && now - this.queue[0].time > INPUT_BUFFER_WINDOW) {
      this.queue.shift();
    }
    if (this.queue.length === 0) return null;
    return this.queue.shift().action;
  }

  clear() {
    this.queue = [];
  }
}
