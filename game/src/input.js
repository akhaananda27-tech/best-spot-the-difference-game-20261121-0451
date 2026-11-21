// Pointer + keyboard input. Mouse clicks are mapped from screen pixels into the
// 1280x720 logical field, then into panel-local coordinates for the world to test.
import { FIELD, PANEL } from './config.js';
import {
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_SCENE_DONE, SCREEN_RESULTS, SCREEN_PAUSED,
  EVENT_FOUND, EVENT_WRONG, EVENT_SCENE_DONE, EVENT_GAME_DONE,
  startRun, nextScene, clickAt, useHint, togglePause, quitToTitle, startScene,
} from './world.js';

function inRect(x, y, r) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function attachInput(canvas, w, sfx) {
  function toLogical(ev) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const ox = (rect.width - FIELD.width * scale) / 2;
    const oy = (rect.height - FIELD.height * scale) / 2;
    return {
      x: (ev.clientX - rect.left - ox) / scale,
      y: (ev.clientY - rect.top - oy) / scale,
    };
  }

  function playSound(ev) {
    if (ev & EVENT_FOUND) sfx.found();
    else if (ev & EVENT_WRONG) sfx.wrong();
    if (ev & EVENT_SCENE_DONE) sfx.sceneDone();
    if (ev & EVENT_GAME_DONE) sfx.gameDone();
  }

  canvas.addEventListener('pointerdown', (ev) => {
    const p = toLogical(ev);
    if (w.screen === SCREEN_TITLE) {
      if (inRect(p.x, p.y, w._startBtn)) {
        sfx.click();
        startRun(w);
      }
      return;
    }
    if (w.screen === SCREEN_SCENE_DONE) {
      if (inRect(p.x, p.y, w._nextBtn)) {
        sfx.click();
        nextScene(w);
      }
      return;
    }
    if (w.screen === SCREEN_RESULTS) {
      if (inRect(p.x, p.y, w._againBtn)) {
        sfx.click();
        startRun(w);
      } else if (inRect(p.x, p.y, w._titleBtn)) {
        sfx.click();
        quitToTitle(w);
      }
      return;
    }
    if (w.screen === SCREEN_PAUSED) {
      if (inRect(p.x, p.y, w._resumeBtn)) {
        sfx.click();
        togglePause(w);
      } else if (inRect(p.x, p.y, w._restartBtn)) {
        sfx.click();
        startScene(w);
      } else if (inRect(p.x, p.y, w._quitBtn)) {
        sfx.click();
        quitToTitle(w);
      }
      return;
    }
    if (w.screen === SCREEN_PLAY) {
      if (inRect(p.x, p.y, w._hintBtn)) {
        if (useHint(w)) sfx.hint();
        return;
      }
      if (inRect(p.x, p.y, w._pauseBtn)) {
        sfx.click();
        togglePause(w);
        return;
      }
      // clicks on either panel, mapped to panel-local coordinates
      for (const panelX of [PANEL.leftX, PANEL.rightX]) {
        if (p.x >= panelX && p.x <= panelX + PANEL.w && p.y >= PANEL.y && p.y <= PANEL.y + PANEL.h) {
          const ev2 = clickAt(w, p.x - panelX, p.y - PANEL.y);
          playSound(ev2);
          return;
        }
      }
    }
  });

  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    if (k === 'm') {
      w.muted = !w.muted;
      return;
    }
    if (w.screen === SCREEN_TITLE && (k === 'enter' || k === ' ')) {
      sfx.click();
      startRun(w);
      return;
    }
    // Enter / Space advances the scene-done and results screens too.
    if (k === 'enter' || k === ' ') {
      if (w.screen === SCREEN_SCENE_DONE) {
        sfx.click();
        nextScene(w);
        return;
      }
      if (w.screen === SCREEN_RESULTS) {
        sfx.click();
        startRun(w);
        return;
      }
    }
    if (k === 'p' || k === 'escape') {
      if (w.screen === SCREEN_PLAY || w.screen === SCREEN_PAUSED) {
        sfx.click();
        togglePause(w);
      }
      return;
    }
    if (k === 'h' && w.screen === SCREEN_PLAY) {
      if (useHint(w)) sfx.hint();
    }
  });
}
