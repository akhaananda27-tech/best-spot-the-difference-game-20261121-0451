// Game state: screens, scenes, found differences, strikes, hints, timer, score.
// The world owns no drawing; render.js reads this state. Input goes through clickAt()
// and the key handlers here so the rules stay in one place.
import { SCENES, DIFFS_PER_SCENE, HINTS_PER_SCENE, HINT_FLASH_SECONDS, WRONG_FLASH_SECONDS, FOUND_FLASH_SECONDS, POINTS_PER_FIND, STRIKE_PENALTY, PANEL } from './config.js';
import { SCENE_DIFFS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_SCENE_DONE = 'scene-done';
export const SCREEN_RESULTS = 'results';
export const SCREEN_PAUSED = 'paused';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_SCENE_DONE = 4;
export const EVENT_GAME_DONE = 8;

export function newWorld() {
  return {
    screen: SCREEN_TITLE,
    prevScreen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    strikes: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintFlash: null, // { id, until } — a difference the hint is pointing at
    wrongFlash: null, // { x, y, until } — a wrong click mark, panel coords
    foundFlash: null, // { id, until } — the most recent find (green ring)
    time: 0, // seconds in the current scene
    totalTime: 0,
    score: 0,
    stars: [0, 0, 0], // per-scene stars
    muted: false,
    best: 0,
    flashT: 0, // seconds since boot, drives pulsing rings
  };
}

/** Start a fresh run from the title screen. */
export function startRun(w) {
  w.screen = SCREEN_PLAY;
  w.sceneIndex = 0;
  w.score = 0;
  w.totalTime = 0;
  w.stars = [0, 0, 0];
  startScene(w);
}

export function startScene(w) {
  w.found = new Set();
  w.strikes = 0;
  w.hintsLeft = HINTS_PER_SCENE;
  w.hintFlash = null;
  w.wrongFlash = null;
  w.foundFlash = null;
  w.time = 0;
  w.screen = SCREEN_PLAY;
}

export function remaining(w) {
  return DIFFS_PER_SCENE - w.found.size;
}

export function sceneDiffs(w) {
  return SCENE_DIFFS[w.sceneIndex];
}

/** Stars for the scene just cleared: 3 for clean + under par, 2 for a decent run, else 1. */
export function starsFor(w) {
  const par = SCENES[w.sceneIndex].par;
  if (w.strikes === 0 && w.time <= par) return 3;
  if (w.strikes <= 2 && w.time <= par * 1.5) return 2;
  return 1;
}

function finishScene(w) {
  const stars = starsFor(w);
  w.stars[w.sceneIndex] = stars;
  const timeBonus = Math.max(0, Math.round((SCENES[w.sceneIndex].par - w.time) * 2));
  w.score += timeBonus;
  w.totalTime += w.time;
  if (w.sceneIndex >= SCENES.length - 1) {
    w.screen = SCREEN_RESULTS;
    return EVENT_GAME_DONE;
  }
  w.screen = SCREEN_SCENE_DONE;
  return EVENT_SCENE_DONE;
}

export function nextScene(w) {
  w.sceneIndex += 1;
  startScene(w);
}

/**
 * A click at panel-local coordinates (x, y) on either panel. Returns an event mask.
 * `panel` is 'left' or 'right' — both panels accept clicks; a hit rings both.
 */
export function clickAt(w, x, y) {
  if (w.screen !== SCREEN_PLAY) return EVENT_NONE;
  const diffs = sceneDiffs(w);
  for (const d of diffs) {
    if (w.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      w.found.add(d.id);
      w.foundFlash = { id: d.id, until: w.flashT + FOUND_FLASH_SECONDS };
      w.score += POINTS_PER_FIND;
      if (w.found.size >= DIFFS_PER_SCENE) return finishScene(w) | EVENT_FOUND;
      return EVENT_FOUND;
    }
  }
  // wrong click: a strike, a red X, and a score penalty
  w.strikes += 1;
  w.score = Math.max(0, w.score - STRIKE_PENALTY);
  w.wrongFlash = { x, y, until: w.flashT + WRONG_FLASH_SECONDS };
  return EVENT_WRONG;
}

/** Spend a hint: point at one unfound difference for two seconds. */
export function useHint(w) {
  if (w.screen !== SCREEN_PLAY || w.hintsLeft <= 0) return false;
  const unfound = sceneDiffs(w).filter((d) => !w.found.has(d.id));
  if (unfound.length === 0) return false;
  w.hintsLeft -= 1;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  w.hintFlash = { id: pick.id, until: w.flashT + HINT_FLASH_SECONDS };
  return true;
}

export function togglePause(w) {
  if (w.screen === SCREEN_PLAY) {
    w.prevScreen = SCREEN_PLAY;
    w.screen = SCREEN_PAUSED;
  } else if (w.screen === SCREEN_PAUSED) {
    w.screen = w.prevScreen;
  }
}

export function quitToTitle(w) {
  w.screen = SCREEN_TITLE;
}

/** Advance the clock; called once per fixed step while playing. */
export function tick(w, dt) {
  w.flashT += dt;
  if (w.screen === SCREEN_PLAY) w.time += dt;
  if (w.hintFlash && w.flashT > w.hintFlash.until) w.hintFlash = null;
  if (w.wrongFlash && w.flashT > w.wrongFlash.until) w.wrongFlash = null;
  if (w.foundFlash && w.flashT > w.foundFlash.until) w.foundFlash = null;
}

export function totalStars(w) {
  return w.stars[0] + w.stars[1] + w.stars[2];
}
