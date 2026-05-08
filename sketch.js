function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
// ROCK 'EM SOCK 'EM — p5.js
// Blue: A/D move, W punch
// Red:  LEFT/RIGHT move, UP punch
// R to reset

const W = 600, H = 300;
const FLOOR = 240;
const RL = 50, RR = 550;

let B, R, score, over, particles;

function setup() {
  createCanvas(W, H);
  noSmooth();
  score = { b: 0, r: 0 };
  doReset();
}

function doReset() {
  B = makeChar(160, true);
  R = makeChar(440, false);
  particles = [];
  over = false;
}

function makeChar(x, isBlue) {
  return {
    x,
    isBlue,
    bodyCol: isBlue ? color(34, 85, 221)  : color(204, 34, 34),
    darkCol: isBlue ? color(17, 34, 136)  : color(136, 17, 17),
    headOff: false,
    headY: 0,
    headVY: 0,
    punchT: 0,
    punchCD: 0,
    hitFlash: 0,
    bob: 0,
    bobDir: 1
  };
}

// ── drawing helpers ──────────────────────────────────────

function drawBlock(x, y, w, h, col) {
  fill(col);
  noStroke();
  rect(round(x), round(y), w, h);
  fill(255, 255, 255, 50);
  rect(round(x), round(y), w, 2);
  rect(round(x), round(y), 2, h);
  fill(0, 0, 0, 64);
  rect(round(x), round(y + h - 2), w, 2);
  rect(round(x + w - 2), round(y), 2, h);
}

function drawChar(ch) {
  let x = round(ch.x);
  let bob = ch.bob;
  let col = ch.bodyCol;
  let dk  = ch.darkCol;
  let ty  = FLOOR + bob;

  let faceDir = ch.isBlue
    ? (R.x >= ch.x ? 1 : -1)
    : (B.x <= ch.x ? -1 : 1);

  let isPunch = ch.punchT > 0;
  let pExt = isPunch ? sin((ch.punchT / 38) * PI) * 34 : 0;

  // boots
  drawBlock(x - 18, ty - 10, 18, 10, col);
  drawBlock(x + 1,  ty - 10, 18, 10, col);

  // legs
  drawBlock(x - 13, ty - 38, 11, 28, dk);
  drawBlock(x + 2,  ty - 38, 11, 28, dk);

  // torso
  drawBlock(x - 17, ty - 86, 34, 48, col);
  fill(0, 0, 0, 38);
  noStroke();
  rect(x - 17, ty - 68, 34, 3);
  rect(x - 1,  ty - 86,  3, 48);

  // non-punch arm
  let npx = faceDir > 0 ? x - 29 : x + 17;
  drawBlock(npx, ty - 84, 11, 34, dk);
  drawBlock(npx - 1, ty - 84 + 34, 13, 13, col);

  // punch arm
  let pbx = faceDir > 0 ? x + 17 : x - 29;
  let gox = faceDir > 0 ? pbx + 11 + pExt : pbx - pExt - 13;
  drawBlock(pbx, ty - 84, 11, 22, dk);
  let gloveCol = isPunch ? color(255) : col;
  drawBlock(gox, ty - 79, 15, 15, gloveCol);

  // head
  if (!ch.headOff) {
    let hy = ty - 120 + bob;
    drawBlock(x - 14, hy, 28, 28, col);
    fill(0, 0, 0, 30);
    noStroke();
    rect(x - 14, hy + 10, 28, 2);
    rect(x - 14, hy + 20, 28, 2);
    rect(x,      hy,       2, 28);
    // name tag
    fill(col);
    noStroke();
    textFont('monospace');
    textSize(9);
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    text(ch.isBlue ? 'BLUE' : 'RED', x, hy - 4);
  } else {
    let hy = round(ch.headY);
    drawBlock(x - 14, hy, 28, 28, col);
    fill(0, 0, 0, 30);
    noStroke();
    rect(x - 14, hy + 10, 28, 2);
    rect(x - 14, hy + 20, 28, 2);
    rect(x,      hy,       2, 28);
  }

  // hit flash
  if (ch.hitFlash > 0) {
    fill(255, 255, 255, (ch.hitFlash / 15) * 128);
    noStroke();
    rect(x - 17, ty - 120, 34, 120);
  }
}

function drawRing() {
  background(26, 26, 46);

  // crowd
  let cc = [
    color(58,32,96), color(96,32,32),
    color(32,80,32), color(32,64,96), color(96,32,96)
  ];
  noStroke();
  for (let i = 0; i < 26; i++) {
    let bx = 14 + i * 22;
    let by = FLOOR - 162 + sin(i * 1.4) * 14;
    fill(cc[i % 5]);
    rect(bx, by, 16, 22);
    rect(bx + 2, by - 13, 12, 14);
  }

  // floor tiles
  noStroke();
  for (let tx = RL; tx < RR; tx += 20) {
    for (let ty = FLOOR - 8; ty < FLOOR + 52; ty += 20) {
      let even = (floor((tx - RL) / 20) + floor((ty - FLOOR + 8) / 20)) % 2 === 0;
      fill(even ? color(245,197,24) : color(224,178,0));
      rect(tx, ty, 20, 20);
    }
  }
  fill(160, 120, 0);
  rect(RL, FLOOR + 50, RR - RL, 6);

  // ropes
  let ropeData = [
    [FLOOR - 130, color(255, 51, 51)],
    [FLOOR - 90,  color(255, 255, 255)],
    [FLOOR - 50,  color(51, 85, 238)]
  ];
  noStroke();
  ropeData.forEach(([ry, rc]) => {
    fill(rc);
    rect(RL - 6, ry - 3, RR - RL + 12, 6);
  });

  // corner posts
  [RL - 6, RR - 6].forEach(px2 => {
    fill(139, 0, 0);
    rect(px2, FLOOR - 155, 14, 165);
    fill(204, 0, 0);
    [FLOOR - 155, FLOOR - 108, FLOOR - 62].forEach(py => rect(px2, py, 14, 4));
    fill(255, 215, 0);
    rect(px2 - 3, FLOOR - 161, 20, 8);
  });
}

function drawParticles() {
  particles.forEach(p => {
    let a = p.life / p.maxLife;
    if (p.text) {
      fill(255, 215, 0, a * 255);
      noStroke();
      textFont('monospace');
      textSize(round(13 + (1 - a) * 7));
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(p.text, round(p.x), round(p.y));
    } else {
      fill(red(p.col), green(p.col), blue(p.col), a * 255);
      noStroke();
      rect(round(p.px - p.r / 2), round(p.py - p.r / 2), round(p.r), round(p.r));
    }
  });
}

function drawHUD() {
  // scores
  textFont('monospace');
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  textSize(13);
  fill(34, 85, 221);
  text('BLUE: ' + score.b, 10, 6);
  textAlign(RIGHT, TOP);
  fill(204, 34, 34);
  text('RED: ' + score.r, W - 10, 6);

  // title
  textAlign(CENTER, TOP);
  textSize(18);
  fill(255, 215, 0);
  text("ROCK 'EM SOCK 'EM", W / 2, 5);

  // controls hint
  textStyle(NORMAL);
  textSize(9);
  fill(150);
  textAlign(LEFT, BOTTOM);
  text('BLUE: A/D move  W punch', 8, H - 4);
  textAlign(RIGHT, BOTTOM);
  text('RED: arrows move  UP punch  |  R reset', W - 8, H - 4);

  // in-range warning
  if (!over && abs(B.x - R.x) < 115) {
    fill(255, 215, 0, 230);
    textAlign(CENTER, TOP);
    textSize(10);
    textStyle(BOLD);
    text('IN RANGE — PUNCH!', W / 2, 30);
  }

  // win message
  if (over) {
    textAlign(CENTER, CENTER);
    textSize(22);
    textStyle(BOLD);
    if (B.headOff) {
      fill(204, 34, 34);
      text('RED WINS!  press R', W / 2, H / 2 + 10);
    } else {
      fill(34, 85, 221);
      text('BLUE WINS!  press R', W / 2, H / 2 + 10);
    }
  }
}

// ── game logic ───────────────────────────────────────────

function tryPunch(att, def) {
  if (att.punchCD > 0 || att.headOff || over) return;
  att.punchCD = 38;
  att.punchT  = 38;
  let dist = abs(att.x - def.x);
  if (dist < 110 && !def.headOff) {
    def.hitFlash = 15;
    def.headOff  = true;
    def.headY    = FLOOR - 108;
    def.headVY   = -10;
    spawnParticles(def.x, FLOOR - 90, def.bodyCol);
    setTimeout(() => {
      over = true;
      if (att.isBlue) score.b++;
      else            score.r++;
    }, 600);
  }
}

function spawnParticles(x, y, col) {
  let words = ['POW!', 'BAM!', 'BONK!', 'OOF!', 'WHAM!'];
  particles.push({
    text: random(words), x, y, vy: -1.5,
    life: 45, maxLife: 45
  });
  for (let i = 0; i < 12; i++) {
    let a  = random(TWO_PI);
    let sp = random(2, 6);
    particles.push({
      px: x, py: y,
      vx: cos(a) * sp, vy: sin(a) * sp - 2,
      r: random(3, 7), col,
      life: 25, maxLife: 25
    });
  }
}

// ── main loop ────────────────────────────────────────────

function draw() {
  let dt = min(deltaTime / 16.67, 3);

  if (!over) {
    let spd = 3 * dt;
    if (keyIsDown(65))          B.x = max(RL + 20, B.x - spd); // A
    if (keyIsDown(68))          B.x = min(RR - 20, B.x + spd); // D
    if (keyIsDown(LEFT_ARROW))  R.x = max(RL + 20, R.x - spd);
    if (keyIsDown(RIGHT_ARROW)) R.x = min(RR - 20, R.x + spd);
  }

  [B, R].forEach(ch => {
    if (ch.punchCD > 0) ch.punchCD -= dt;
    if (ch.punchT  > 0) ch.punchT  -= dt * 2;
    if (ch.hitFlash> 0) ch.hitFlash -= dt;
    ch.bob += ch.bobDir * 0.06 * dt;
    if (ch.bob >  2) ch.bobDir = -1;
    if (ch.bob < -2) ch.bobDir =  1;
    if (ch.headOff) {
      ch.headY  += ch.headVY * dt;
      ch.headVY += 0.55 * dt;
    }
  });

  particles.forEach(p => {
    if (p.px !== undefined) {
      p.px += p.vx * dt;
      p.py += p.vy * dt;
      p.vy += 0.15 * dt;
    } else {
      p.y += p.vy * dt;
    }
    p.life -= dt;
  });
  particles = particles.filter(p => p.life > 0);

  drawRing();
  drawParticles();
  drawChar(B);
  drawChar(R);
  drawHUD();
}

function keyPressed() {
  if (keyCode === 87) tryPunch(B, R);       // W
  if (keyCode === UP_ARROW) tryPunch(R, B);
  if (key === 'r' || key === 'R') doReset();
}