// The three scenes. Every scene is drawn twice: once as the original (left panel) and
// once with a set of differences applied (right panel). All art is procedural canvas
// vector work — no image files, no network. Panel space is 600x460.
//
// A difference is { id, x, y, r, label }: the spot a player must click. The draw
// function for a scene takes `applied`, a Set of difference ids to render changed.

function circle(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ellipse(g, x, y, rx, ry, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function rect(g, x, y, w, h, fill) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
}

function poly(g, pts, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
}

function star4(g, x, y, r, fill) {
  poly(g, [[x, y - r], [x + r * 0.28, y - r * 0.28], [x + r, y], [x + r * 0.28, y + r * 0.28], [x, y + r], [x - r * 0.28, y + r * 0.28], [x - r, y], [x - r * 0.28, y - r * 0.28]], fill);
}

function gull(g, x, y, s) {
  g.strokeStyle = '#3a3f4d';
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(x - 10 * s, y);
  g.quadraticCurveTo(x - 4 * s, y - 8 * s, x, y);
  g.quadraticCurveTo(x + 4 * s, y - 8 * s, x + 10 * s, y);
  g.stroke();
}

function cloud(g, x, y, s, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, 22 * s, 0, Math.PI * 2);
  g.arc(x + 24 * s, y - 8 * s, 18 * s, 0, Math.PI * 2);
  g.arc(x + 46 * s, y, 20 * s, 0, Math.PI * 2);
  g.arc(x + 22 * s, y + 8 * s, 20 * s, 0, Math.PI * 2);
  g.fill();
}

function waves(g, y0, y1, col) {
  g.strokeStyle = col;
  g.lineWidth = 3;
  for (let y = y0; y <= y1; y += 18) {
    g.beginPath();
    for (let x = 0; x <= 600; x += 30) {
      const yy = y + Math.sin((x + y * 7) * 0.03) * 3;
      if (x === 0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }
}

// ---------------------------------------------------------------- scene 1: Sunset Pier
export const DIFFS_1 = [
  { id: 1, x: 470, y: 80, r: 55, label: 'sun rays' },
  { id: 2, x: 220, y: 100, r: 25, label: 'a gull' },
  { id: 3, x: 330, y: 318, r: 42, label: 'sail colour' },
  { id: 4, x: 120, y: 420, r: 30, label: 'a crate' },
  { id: 5, x: 250, y: 375, r: 25, label: 'a jumping fish' },
  { id: 6, x: 540, y: 392, r: 25, label: 'flag colour' },
  { id: 7, x: 60, y: 165, r: 30, label: 'lighthouse light' },
];

export function drawScene1(g, applied) {
  const A = (id) => applied.has(id);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ff9d5c');
  sky.addColorStop(0.6, '#ffb36b');
  sky.addColorStop(1, '#ffd9a0');
  g.fillStyle = sky;
  g.fillRect(0, 0, 600, 300);
  // sun + rays (diff 1: rays vanish)
  circle(g, 470, 80, 42, '#ffd94d');
  if (!A(1)) {
    g.strokeStyle = '#ffd94d';
    g.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(470 + Math.cos(a) * 50, 80 + Math.sin(a) * 50);
      g.lineTo(470 + Math.cos(a) * 62, 80 + Math.sin(a) * 62);
      g.stroke();
    }
  }
  cloud(g, 100, 70, 1, 'rgba(255,255,255,0.92)');
  cloud(g, 300, 48, 0.8, 'rgba(255,255,255,0.85)');
  cloud(g, 510, 130, 0.7, 'rgba(255,255,255,0.8)');
  gull(g, 150, 120, 1);
  if (!A(2)) gull(g, 220, 100, 1);
  gull(g, 380, 92, 0.9);
  // lighthouse (diff 7: lamp glow on/off)
  rect(g, 48, 190, 24, 90, '#e8e4da');
  rect(g, 48, 210, 24, 14, '#d84a4a');
  rect(g, 48, 240, 24, 14, '#d84a4a');
  rect(g, 44, 176, 32, 16, '#3a3f4d');
  circle(g, 60, 168, 9, '#ffd94d');
  if (!A(7)) {
    g.fillStyle = 'rgba(255,217,77,0.35)';
    g.beginPath();
    g.arc(60, 168, 26, 0, Math.PI * 2);
    g.fill();
  }
  // sea
  const sea = g.createLinearGradient(0, 300, 0, 405);
  sea.addColorStop(0, '#2f7fb8');
  sea.addColorStop(1, '#1e5f8f');
  g.fillStyle = sea;
  g.fillRect(0, 300, 600, 105);
  waves(g, 315, 390, 'rgba(255,255,255,0.35)');
  // boats, each with a pale wake line on the water
  poly(g, [[315, 345], [330, 295], [345, 345]], A(3) ? '#ffd94d' : '#d84a4a'); // sail (diff 3)
  rect(g, 305, 345, 52, 14, '#8a4a2a');
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(300, 364);
  g.lineTo(362, 364);
  g.stroke();
  poly(g, [[465, 360], [480, 322], [495, 360]], '#3f9fd8');
  rect(g, 458, 360, 46, 12, '#2a6ea8');
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(453, 376);
  g.lineTo(509, 376);
  g.stroke();
  poly(g, [[165, 358], [178, 326], [191, 358]], '#3fce7c');
  rect(g, 160, 358, 38, 11, '#2a7a4a');
  g.beginPath();
  g.moveTo(155, 373);
  g.lineTo(203, 373);
  g.stroke();
  // jumping fish (diff 5)
  if (!A(5)) {
    ellipse(g, 250, 375, 14, 7, '#4fc3f7');
    poly(g, [[262, 375], [272, 368], [272, 382]], '#4fc3f7');
  }
  // pier deck
  rect(g, 0, 405, 600, 55, '#8a6a4a');
  g.fillStyle = '#77572f';
  for (let x = 0; x < 600; x += 48) g.fillRect(x, 405, 3, 55);
  for (let x = 20; x < 600; x += 90) rect(g, x, 440, 10, 20, '#6b4a28');
  // crate (diff 4)
  if (!A(4)) {
    rect(g, 102, 398, 36, 36, '#b07a3a');
    g.strokeStyle = '#7a5220';
    g.lineWidth = 3;
    g.strokeRect(102, 398, 36, 36);
    g.beginPath();
    g.moveTo(102, 398);
    g.lineTo(138, 434);
    g.moveTo(138, 398);
    g.lineTo(102, 434);
    g.stroke();
  }
  // bucket + rope
  rect(g, 288, 412, 24, 22, '#c94f4f');
  ellipse(g, 288 + 12, 412, 12, 4, '#8a2f2f');
  g.strokeStyle = '#d9c08a';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(420, 428, 14, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(420, 428, 8, 0, Math.PI * 2);
  g.stroke();
  // flag (diff 6: red vs blue)
  rect(g, 536, 360, 5, 52, '#5a4632');
  poly(g, [[541, 362], [572, 371], [541, 380]], A(6) ? '#3f6fd8' : '#d84a4a');
}

// ---------------------------------------------------------------- scene 2: Lantern Quay
export const DIFFS_2 = [
  { id: 1, x: 500, y: 80, r: 45, label: 'the moon' },
  { id: 2, x: 300, y: 60, r: 20, label: 'a star' },
  { id: 3, x: 350, y: 200, r: 25, label: 'a lantern' },
  { id: 4, x: 300, y: 292, r: 45, label: 'an awning' },
  { id: 5, x: 300, y: 362, r: 30, label: 'the fruit' },
  { id: 6, x: 520, y: 415, r: 25, label: 'the cat' },
  { id: 7, x: 80, y: 230, r: 22, label: 'a lantern' },
];

function lantern(g, x, y, col) {
  g.strokeStyle = '#0e1424';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y - 26);
  g.lineTo(x, y - 12);
  g.stroke();
  ellipse(g, x, y, 13, 16, col);
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(x - 4, y - 12, 3, 20);
  circle(g, x, y + 18, 3, '#f5b81e');
}

function stall(g, x, awning, goods) {
  // awning
  poly(g, [[x - 62, 300], [x + 62, 300], [x + 52, 272], [x - 52, 272]], awning);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = -2; i <= 2; i += 1) poly(g, [[x + i * 24 - 8, 300], [x + i * 24 + 8, 300], [x + i * 24 + 6, 272], [x + i * 24 - 6, 272]], 'rgba(255,255,255,0.35)');
  // counter + goods
  rect(g, x - 52, 300, 104, 62, '#5a4632');
  rect(g, x - 56, 296, 112, 8, '#7a5a38');
  for (let i = 0; i < 5; i += 1) circle(g, x - 36 + i * 18, 288, 8, goods);
  // legs
  rect(g, x - 48, 362, 8, 26, '#3a2c1c');
  rect(g, x + 40, 362, 8, 26, '#3a2c1c');
}

export function drawScene2(g, applied) {
  const A = (id) => applied.has(id);
  // night sky
  const sky = g.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#141a38');
  sky.addColorStop(1, '#2c3a75');
  g.fillStyle = sky;
  g.fillRect(0, 0, 600, 260);
  // stars (diff 2: one star missing)
  star4(g, 90, 70, 10, '#ffe9a8');
  star4(g, 180, 110, 7, '#ffffff');
  if (!A(2)) star4(g, 300, 60, 9, '#ffffff');
  star4(g, 400, 130, 7, '#ffe9a8');
  star4(g, 120, 180, 6, '#ffffff');
  star4(g, 250, 170, 6, '#ffffff');
  // moon (diff 1: full vs crescent)
  circle(g, 500, 80, 34, '#ffe9a8');
  if (A(1)) circle(g, 514, 72, 30, '#2c3a75');
  // mountains
  g.fillStyle = '#10152c';
  g.beginPath();
  g.moveTo(0, 260);
  for (let x = 0; x <= 600; x += 60) g.lineTo(x + 30, 210 + ((x / 60) % 2) * 18);
  g.lineTo(600, 260);
  g.closePath();
  g.fill();
  // string lights
  g.strokeStyle = '#0e1424';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 150);
  g.quadraticCurveTo(300, 190, 600, 150);
  g.stroke();
  for (let i = 0; i < 9; i += 1) {
    const x = 30 + i * 67;
    const y = 150 + Math.sin((x / 600) * Math.PI) * 28;
    circle(g, x, y + 8, 5, ['#f5b81e', '#ff7a5c', '#3fce7c'][i % 3]);
  }
  // lanterns (diff 3: purple vs blue; diff 7: extra green lantern on right)
  lantern(g, 150, 200, '#ff8c3a');
  lantern(g, 250, 190, '#e5534b');
  lantern(g, 350, 200, A(3) ? '#3f6fd8' : '#a55eea');
  lantern(g, 450, 190, '#ff8c3a');
  if (A(7)) lantern(g, 80, 230, '#3fce7c');
  // ground
  rect(g, 0, 260, 600, 200, '#1d2440');
  rect(g, 0, 388, 600, 72, '#141a30');
  // stalls (diff 4: middle awning blue vs pink; diff 5: fruit orange vs green)
  stall(g, 90, '#d84a4a', '#3fce7c');
  stall(g, 300, A(4) ? '#e86aa8' : '#3f6fd8', A(5) ? '#3fce7c' : '#ff8c3a');
  stall(g, 500, '#2a9d6a', '#ff8c3a');
  // MARKET sign
  rect(g, 240, 318, 120, 26, '#f5b81e');
  g.fillStyle = '#1d2440';
  g.font = 'bold 17px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MARKET', 300, 332);
  // water strip + boat
  rect(g, 0, 388, 600, 14, '#2a4a72');
  g.strokeStyle = 'rgba(255,255,255,0.3)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(20, 396);
  g.lineTo(120, 396);
  g.moveTo(400, 394);
  g.lineTo(560, 394);
  g.stroke();
  poly(g, [[110, 420], [122, 396], [134, 420]], '#d8c9a8');
  rect(g, 102, 420, 44, 10, '#7a5a38');
  // crate + cat (diff 6)
  rect(g, 500, 418, 40, 26, '#8a6a3a');
  g.strokeStyle = '#6b4a28';
  g.lineWidth = 2;
  g.strokeRect(500, 418, 40, 26);
  if (!A(6)) {
    g.fillStyle = '#10152c';
    ellipse(g, 520, 414, 13, 9, '#10152c');
    circle(g, 512, 404, 7, '#10152c');
    poly(g, [[507, 398], [510, 390], [514, 398]], '#10152c');
    poly(g, [[514, 398], [518, 390], [520, 398]], '#10152c');
    g.strokeStyle = '#10152c';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(532, 414);
    g.quadraticCurveTo(542, 406, 540, 396);
    g.stroke();
  }
}

// ---------------------------------------------------------------- scene 3: Seaside Fair
export const DIFFS_3 = [
  { id: 1, x: 450, y: 272, r: 28, label: 'a wheel cabin' },
  { id: 2, x: 345, y: 108, r: 25, label: 'a balloon' },
  { id: 3, x: 380, y: 34, r: 20, label: 'a bunting flag' },
  { id: 4, x: 250, y: 382, r: 28, label: 'an ice-cream scoop' },
  { id: 5, x: 450, y: 90, r: 35, label: 'a cloud' },
  { id: 6, x: 520, y: 420, r: 28, label: 'the beach ball' },
  { id: 7, x: 120, y: 310, r: 35, label: 'the stall sign' },
];

function ferrisWheel(g, cabinCol) {
  // legs + hub
  g.strokeStyle = '#5a4632';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(450, 300);
  g.lineTo(400, 380);
  g.moveTo(450, 300);
  g.lineTo(500, 380);
  g.stroke();
  circle(g, 450, 205, 92, '#e8f4fa');
  g.strokeStyle = '#8a97a8';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(450, 205, 92, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(450, 205, 55, 0, Math.PI * 2);
  g.stroke();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(450, 205);
    g.lineTo(450 + Math.cos(a) * 92, 205 + Math.sin(a) * 92);
    g.stroke();
  }
  // cabins: 8 around the rim, the bottom one is the difference
  const cols = ['#d84a4a', '#3f6fd8', '#f5b81e', '#3fce7c', '#e86aa8', '#8a5cf6', '#ff8c3a', '#2a9d6a'];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const cx = 450 + Math.cos(a) * 92;
    const cy = 205 + Math.sin(a) * 92;
    circle(g, cx, cy, 11, i === 2 ? cabinCol : cols[i]);
  }
  circle(g, 450, 205, 12, '#f5b81e');
}

export function drawScene3(g, applied) {
  const A = (id) => applied.has(id);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#6ec1f0');
  sky.addColorStop(1, '#cfeeff');
  g.fillStyle = sky;
  g.fillRect(0, 0, 600, 280);
  // sun
  circle(g, 90, 70, 36, '#ffd94d');
  g.strokeStyle = '#ffd94d';
  g.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(90 + Math.cos(a) * 43, 70 + Math.sin(a) * 43);
    g.lineTo(90 + Math.cos(a) * 53, 70 + Math.sin(a) * 53);
    g.stroke();
  }
  cloud(g, 230, 60, 0.9, 'rgba(255,255,255,0.95)');
  if (!A(5)) cloud(g, 440, 90, 0.75, 'rgba(255,255,255,0.9)');
  // bunting (diff 3: one flag red vs green)
  g.strokeStyle = '#5a4632';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(180, 22);
  g.quadraticCurveTo(380, 52, 580, 22);
  g.stroke();
  const flagCols = ['#d84a4a', '#f5b81e', '#3f6fd8', '#3fce7c', '#e86aa8'];
  for (let i = 0; i < 10; i += 1) {
    const x = 200 + i * 40;
    const y = 22 + Math.sin(((x - 180) / 400) * Math.PI) * 26;
    poly(g, [[x - 9, y], [x + 9, y], [x, y + 18]], i === 4 ? (A(3) ? '#3fce7c' : '#d84a4a') : flagCols[i % 5]);
  }
  // balloons (diff 2: yellow balloon missing)
  g.strokeStyle = '#5a4632';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(330, 180);
  g.lineTo(318, 130);
  g.moveTo(330, 180);
  g.lineTo(345, 128);
  g.moveTo(330, 180);
  g.lineTo(360, 135);
  g.stroke();
  ellipse(g, 318, 112, 14, 18, '#d84a4a');
  if (!A(2)) ellipse(g, 345, 108, 14, 18, '#f5b81e');
  ellipse(g, 362, 118, 14, 18, '#3f6fd8');
  // sea
  const sea = g.createLinearGradient(0, 280, 0, 380);
  sea.addColorStop(0, '#3f9fd8');
  sea.addColorStop(1, '#2a7ab0');
  g.fillStyle = sea;
  g.fillRect(0, 280, 600, 100);
  waves(g, 300, 360, 'rgba(255,255,255,0.4)');
  // ferris wheel (diff 1: bottom cabin red vs green)
  ferrisWheel(g, A(1) ? '#3fce7c' : '#d84a4a');
  // sand
  rect(g, 0, 380, 600, 80, '#f0dcae');
  // stall with sign (diff 7: ICE vs FUN)
  poly(g, [[68, 330], [172, 330], [160, 300], [80, 300]], '#e86aa8');
  rect(g, 74, 330, 92, 60, '#8a6a3a');
  rect(g, 70, 326, 100, 8, '#6b4a28');
  rect(g, 88, 300, 64, 26, '#f5f0dc');
  g.fillStyle = '#1d2440';
  g.font = 'bold 16px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(A(7) ? 'FUN' : 'ICE', 120, 313);
  // ice-cream cart (diff 4: 2 vs 3 scoops)
  rect(g, 228, 398, 52, 30, '#3f6fd8');
  circle(g, 238, 398, 5, '#3a3f4d');
  circle(g, 270, 398, 5, '#3a3f4d');
  poly(g, [[240, 398], [254, 372], [268, 398]], '#e8b06a');
  circle(g, 247, 372, 10, '#ff9ec6');
  circle(g, 261, 372, 10, '#fff3c9');
  if (A(4)) circle(g, 254, 358, 10, '#a55eea');
  rect(g, 222, 392, 64, 6, '#f5b81e');
  // beach ball (diff 6: stripes red vs blue)
  circle(g, 520, 420, 24, '#f5f0dc');
  g.save();
  g.beginPath();
  g.arc(520, 420, 24, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = A(6) ? '#3f6fd8' : '#d84a4a';
  g.beginPath();
  g.moveTo(520, 396);
  g.lineTo(544, 420);
  g.lineTo(520, 444);
  g.lineTo(496, 420);
  g.closePath();
  g.fill();
  g.restore();
  g.strokeStyle = '#8a97a8';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(520, 420, 24, 0, Math.PI * 2);
  g.stroke();
  // starfish + a little sandcastle on the sand
  star4(g, 80, 430, 12, '#ff8c3a');
  star4(g, 350, 435, 9, '#e86aa8');
  poly(g, [[168, 446], [176, 420], [184, 446]], '#e8c98a');
  rect(g, 164, 446, 24, 8, '#d9b878');
  circle(g, 176, 416, 4, '#d84a4a');
}

export const SCENE_DRAW = [drawScene1, drawScene2, drawScene3];
export const SCENE_DIFFS = [DIFFS_1, DIFFS_2, DIFFS_3];
