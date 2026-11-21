// Boot + main loop. The canvas is a fixed 1280x720 logical field, letterboxed to the
// window. ?shot=start|play|play2|end stages a screenshot scene instead of the title.
import { FIELD, STEP, BEST_KEY } from './config.js';
import { newWorld, tick } from './world.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { makeSfx } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
canvas.width = FIELD.width;
canvas.height = FIELD.height;

const world = newWorld();
try {
  world.best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
} catch (e) {
  world.best = 0;
}
const sfx = makeSfx(world);
attachInput(canvas, world, sfx);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(shot, world);
  // A staged shot is a still frame: render once, no loop, no timer.
  render(g, world);
} else {
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      tick(world, STEP);
      acc -= STEP;
    }
    // Keep the live best score in step with the run, not only on unload.
    if (world.score > world.best) world.best = world.score;
    render(g, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Keep the best score between visits.
window.addEventListener('beforeunload', () => {
  try {
    const best = Math.max(world.best, world.score);
    if (best > 0) localStorage.setItem(BEST_KEY, String(best));
  } catch (e) {
    /* storage unavailable — the game still plays */
  }
});

// Fit the 1280x720 field into the window, letterboxed.
function fit() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
}
window.addEventListener('resize', fit);
fit();
