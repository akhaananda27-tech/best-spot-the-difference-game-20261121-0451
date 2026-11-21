// All drawing: HUD, the two scene panels, rings on found differences, the Found dots,
// and the title / scene-done / results / paused screens. Pure canvas 2D, system font.
import { FIELD, PANEL, PALETTE, FONT, SCENES, DIFFS_PER_SCENE } from './config.js';
import { SCENE_DRAW, SCENE_DIFFS } from './scenes.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_SCENE_DONE, SCREEN_RESULTS, SCREEN_PAUSED, remaining, totalStars } from './world.js';

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function button(g, x, y, w, h, label, enabled) {
  g.fillStyle = enabled ? PALETTE.amber : '#3a4258';
  roundRect(g, x, y, w, h, 10);
  g.fill();
  g.fillStyle = enabled ? '#1d2440' : PALETTE.muted;
  g.font = 'bold 17px ' + FONT;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, x + w / 2, y + h / 2 + 1);
  return { x, y, w, h };
}

function ring(g, x, y, r, col, width) {
  g.strokeStyle = col;
  g.lineWidth = width;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
}

function drawPanel(g, w, panelX, isRight) {
  const draw = SCENE_DRAW[w.sceneIndex];
  const diffs = SCENE_DIFFS[w.sceneIndex];
  const applied = isRight ? new Set(diffs.map((d) => d.id)) : new Set();
  g.save();
  g.beginPath();
  g.rect(panelX, PANEL.y, PANEL.w, PANEL.h);
  g.clip();
  g.translate(panelX, PANEL.y);
  draw(g, applied);
  g.restore();
  // panel frame
  g.strokeStyle = '#2c3652';
  g.lineWidth = 2;
  g.strokeRect(panelX, PANEL.y, PANEL.w, PANEL.h);
  // label above the panel
  g.fillStyle = PALETTE.text;
  g.font = 'bold 14px ' + FONT;
  g.textAlign = 'center';
  g.fillText(isRight ? 'RIGHT — spot the changes' : 'LEFT — original', panelX + PANEL.w / 2, PANEL.y - 12);
  return diffs;
}

function drawRings(g, w, panelX, diffs) {
  for (const d of diffs) {
    if (!w.found.has(d.id)) continue;
    const isNew = w.foundFlash && w.foundFlash.id === d.id;
    const col = isNew ? PALETTE.ringNew : PALETTE.ring;
    const width = isNew ? 6 : 5;
    ring(g, panelX + d.x, PANEL.y + d.y, d.r + 6, col, width);
  }
  // hint pulse on one unfound difference
  if (w.hintFlash) {
    const d = diffs.find((x) => x.id === w.hintFlash.id);
    if (d && !w.found.has(d.id)) {
      const pulse = 1 + 0.18 * Math.sin(w.flashT * 10);
      ring(g, panelX + d.x, PANEL.y + d.y, (d.r + 8) * pulse, '#7ec8f2', 4);
    }
  }
  // wrong-click X on this panel (stored in panel coords, drawn on both)
  if (w.wrongFlash) {
    const { x, y } = w.wrongFlash;
    g.strokeStyle = PALETTE.red;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(panelX + x - 12, PANEL.y + y - 12);
    g.lineTo(panelX + x + 12, PANEL.y + y + 12);
    g.moveTo(panelX + x + 12, PANEL.y + y - 12);
    g.lineTo(panelX + x - 12, PANEL.y + y + 12);
    g.stroke();
  }
}

function drawHud(g, w) {
  const scene = SCENES[w.sceneIndex];
  g.fillStyle = PALETTE.hud;
  g.fillRect(0, 0, FIELD.width, 64);
  // left: scene name + par
  g.fillStyle = PALETTE.text;
  g.font = 'bold 21px ' + FONT;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(scene.name, 24, 24);
  g.fillStyle = PALETTE.muted;
  g.font = '15px ' + FONT;
  g.fillText(`Scene ${w.sceneIndex + 1} of 3 · Par ${fmtTime(scene.par)}`, 24, 48);
  // centre: remaining
  g.fillStyle = PALETTE.gold;
  g.font = 'bold 30px ' + FONT;
  g.textAlign = 'center';
  g.fillText(`${remaining(w)} to find`, FIELD.width / 2, 32);
  // right: timer, strikes, buttons
  g.fillStyle = PALETTE.text;
  g.font = 'bold 19px ' + FONT;
  g.textAlign = 'right';
  g.fillText(`⏱ ${fmtTime(w.time)}`, 1000, 24);
  g.fillStyle = PALETTE.muted;
  g.font = '15px ' + FONT;
  g.fillText(`Strikes: ${w.strikes}`, 1000, 48);
  w._hintBtn = button(g, 1024, 12, 108, 40, `Hint (${w.hintsLeft})`, w.hintsLeft > 0);
  w._pauseBtn = button(g, 1144, 12, 112, 40, 'Pause', true);
  // VS between panels
  g.fillStyle = PALETTE.vs;
  g.font = 'bold 20px ' + FONT;
  g.textAlign = 'center';
  g.fillText('VS', 640, PANEL.y + PANEL.h / 2);
  // Found dots
  g.fillStyle = PALETTE.muted;
  g.font = '15px ' + FONT;
  g.textAlign = 'right';
  g.fillText('Found:', 560, 668);
  for (let i = 0; i < DIFFS_PER_SCENE; i += 1) {
    const cx = 580 + i * 30;
    const cy = 668;
    if (w.found.has(SCENE_DIFFS[w.sceneIndex][i].id)) {
      g.fillStyle = PALETTE.green;
      g.beginPath();
      g.arc(cx, cy, 11, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#0e1424';
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(cx - 5, cy);
      g.lineTo(cx - 1, cy + 4);
      g.lineTo(cx + 5, cy - 4);
      g.stroke();
    } else {
      g.strokeStyle = PALETTE.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, 11, 0, Math.PI * 2);
      g.stroke();
    }
  }
  // score, bottom left
  g.fillStyle = PALETTE.muted;
  g.font = '15px ' + FONT;
  g.textAlign = 'left';
  g.fillText(`Score ${w.score}`, 24, 668);
  g.fillText(`Best ${w.best}`, 24, 690);
  // stars earned so far, bottom right
  g.fillStyle = PALETTE.gold;
  g.font = '17px ' + FONT;
  g.textAlign = 'right';
  let starsRow = '';
  for (let i = 0; i < totalStars(w); i += 1) starsRow += '★';
  g.fillText(starsRow || '☆☆☆', FIELD.width - 24, 668);
  g.fillStyle = PALETTE.muted;
  g.font = '13px ' + FONT;
  g.fillText(`${totalStars(w)} of 9 stars`, FIELD.width - 24, 690);
}

function drawTitle(g, w) {
  g.fillStyle = PALETTE.backdrop;
  g.fillRect(0, 0, FIELD.width, FIELD.height);
  g.fillStyle = PALETTE.text;
  g.font = 'bold 64px ' + FONT;
  g.textAlign = 'center';
  g.fillText('TWIN TIDES', FIELD.width / 2, 118);
  g.fillStyle = PALETTE.gold;
  g.font = '24px ' + FONT;
  g.fillText('a spot-the-difference game', FIELD.width / 2, 158);
  // two mini previews of scene 1
  const pw = 300;
  const ph = 230;
  const y0 = 200;
  for (let side = 0; side < 2; side += 1) {
    const x0 = FIELD.width / 2 - pw - 16 + side * (pw + 32);
    g.save();
    g.beginPath();
    g.rect(x0, y0, pw, ph);
    g.clip();
    g.translate(x0, y0);
    g.scale(pw / PANEL.w, ph / PANEL.h);
    SCENE_DRAW[0](g, side === 1 ? new Set(SCENE_DIFFS[0].map((d) => d.id)) : new Set());
    g.restore();
    g.strokeStyle = '#2c3652';
    g.lineWidth = 2;
    g.strokeRect(x0, y0, pw, ph);
  }
  g.fillStyle = PALETTE.text;
  g.font = '17px ' + FONT;
  g.fillText('Two pictures side by side — 7 things are different in each scene.', FIELD.width / 2, 478);
  g.fillText('Click a difference in either picture to ring it on both. Hints help, strikes cost stars.', FIELD.width / 2, 506);
  g.fillText('Find all 7 to clear the scene. Three scenes: Sunset Pier, Lantern Quay, Seaside Fair.', FIELD.width / 2, 534);
  w._startBtn = button(g, FIELD.width / 2 - 90, 566, 180, 52, '▶  Start', true);
  g.fillStyle = PALETTE.muted;
  g.font = '14px ' + FONT;
  g.fillText('P / Esc pauses · H for a hint · M mutes', FIELD.width / 2, 644);
}

function drawSceneDone(g, w) {
  drawPlay(g, w);
  g.fillStyle = 'rgba(14,20,36,0.72)';
  g.fillRect(0, 0, FIELD.width, FIELD.height);
  g.fillStyle = PALETTE.text;
  g.font = 'bold 44px ' + FONT;
  g.textAlign = 'center';
  g.fillText('Scene clear!', FIELD.width / 2, 240);
  const stars = w.stars[w.sceneIndex];
  g.font = '52px ' + FONT;
  let row = '';
  for (let i = 0; i < 3; i += 1) row += i < stars ? '★' : '☆';
  g.fillStyle = PALETTE.gold;
  g.fillText(row, FIELD.width / 2, 310);
  g.fillStyle = PALETTE.muted;
  g.font = '19px ' + FONT;
  g.fillText(`Time ${fmtTime(w.time)} · Strikes ${w.strikes} · Score ${w.score}`, FIELD.width / 2, 360);
  w._nextBtn = button(g, FIELD.width / 2 - 90, 400, 180, 52, 'Next scene ▶', true);
}

function drawResults(g, w) {
  g.fillStyle = PALETTE.backdrop;
  g.fillRect(0, 0, FIELD.width, FIELD.height);
  g.fillStyle = PALETTE.text;
  g.font = 'bold 44px ' + FONT;
  g.textAlign = 'center';
  g.fillText('All scenes clear!', FIELD.width / 2, 200);
  const stars = totalStars(w);
  g.fillStyle = PALETTE.gold;
  g.font = '56px ' + FONT;
  let row = '';
  for (let i = 0; i < 9; i += 1) row += i < stars ? '★' : '☆';
  g.fillText(row, FIELD.width / 2, 280);
  g.fillStyle = PALETTE.text;
  g.font = '22px ' + FONT;
  g.fillText(`${stars} of 9 stars · Score ${w.score} · Total time ${fmtTime(w.totalTime)}`, FIELD.width / 2, 340);
  g.fillStyle = PALETTE.muted;
  g.font = '17px ' + FONT;
  g.fillText(`Best score ${Math.max(w.best, w.score)}`, FIELD.width / 2, 376);
  w._againBtn = button(g, FIELD.width / 2 - 90, 420, 180, 52, '↻  Play again', true);
  w._titleBtn = button(g, FIELD.width / 2 - 90, 488, 180, 48, 'Title screen', true);
}

function drawPaused(g, w) {
  drawPlay(g, w);
  g.fillStyle = 'rgba(14,20,36,0.75)';
  g.fillRect(0, 0, FIELD.width, FIELD.height);
  g.fillStyle = PALETTE.text;
  g.font = 'bold 44px ' + FONT;
  g.textAlign = 'center';
  g.fillText('Paused', FIELD.width / 2, 250);
  w._resumeBtn = button(g, FIELD.width / 2 - 90, 300, 180, 50, 'Resume', true);
  w._restartBtn = button(g, FIELD.width / 2 - 90, 362, 180, 50, 'Restart scene', true);
  w._quitBtn = button(g, FIELD.width / 2 - 90, 424, 180, 50, 'Quit to title', true);
  g.fillStyle = PALETTE.muted;
  g.font = '15px ' + FONT;
  g.fillText(`M ${w.muted ? 'unmutes' : 'mutes'} · H for a hint`, FIELD.width / 2, 510);
}

function drawPlay(g, w) {
  g.fillStyle = PALETTE.backdrop;
  g.fillRect(0, 0, FIELD.width, FIELD.height);
  drawHud(g, w);
  const diffs = drawPanel(g, w, PANEL.leftX, false);
  drawPanel(g, w, PANEL.rightX, true);
  drawRings(g, w, PANEL.leftX, diffs);
  drawRings(g, w, PANEL.rightX, diffs);
}

export function render(g, w) {
  g.clearRect(0, 0, FIELD.width, FIELD.height);
  if (w.screen === SCREEN_TITLE) drawTitle(g, w);
  else if (w.screen === SCREEN_PLAY) drawPlay(g, w);
  else if (w.screen === SCREEN_SCENE_DONE) drawSceneDone(g, w);
  else if (w.screen === SCREEN_RESULTS) drawResults(g, w);
  else if (w.screen === SCREEN_PAUSED) drawPaused(g, w);
}
