const fs = require('fs');
const path = require('path');

console.log('=== Step 1: Copying initial_stargazer.js to particle/stargazer.js ===');
fs.copyFileSync('scratch/initial_stargazer.js', 'particle/stargazer.js');

console.log('=== Step 2: Applying history_line_723.js (Clean Boundary Rebuild) ===');
eval(fs.readFileSync(path.resolve('scratch/history_line_723.js'), 'utf8'));

console.log('=== Step 3: Applying extracted_line_774.js (Epic Milky Way Night Sky) ===');
eval(fs.readFileSync(path.resolve('scratch/extracted_line_774.js'), 'utf8'));

console.log('=== Step 4: Applying extracted_line_794.js (Diverse Major Stars) ===');
eval(fs.readFileSync(path.resolve('scratch/extracted_line_794.js'), 'utf8'));

console.log('=== Step 5: Restoring index.html isExactModel Physics ===');
let html = fs.readFileSync('index.html', 'utf8');

const targetWrongPhysics = `            } else {
              let dx = tx - posX[i], dy = ty - posY[i];
              const dist = Math.sqrt(dx * dx + dy * dy);
              let ds = pSpeed[i]; if (dist < 80) ds = (dist / 80) * ds;
              if (dist > 0.001) { dx = (dx / dist) * ds; dy = (dy / dist) * ds; }
              ax = dx - velX[i]; ay = dy - velY[i];
              const mag = Math.sqrt(ax * ax + ay * ay);
              if (mag > pForce[i]) { ax = (ax / mag) * pForce[i]; ay = (ay / mag) * pForce[i]; }

              if (shockwaves.length > 0) {
                for (let s = 0; s < shockwaves.length; s++) {
                  const sw = shockwaves[s];
                  const sdx = posX[i] - sw.x;
                  const sdy = posY[i] - sw.y;
                  const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
                  const diff = Math.abs(sdist - sw.radius);
                  if (diff < 45 && sdist > 0.01) {
                    const bl = sw.power * (1 - diff / 45);
                    ax += (sdx / sdist) * bl;
                    ay += (sdy / sdist) * bl;
                  }
                }
              }

              if (vortexes.length > 0) {
                for (let v = 0; v < vortexes.length; v++) {
                  const vt = vortexes[v];
                  const vdx = vt.x - posX[i];
                  const vdy = vt.y - posY[i];
                  const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
                  const maxR = 400;
                  if (vdist < maxR && vdist > 0.1) {
                    const pull = Math.pow(1.0 - vdist / maxR, 1.5) * vt.power * 1.25;
                    ax += (vdx / vdist) * pull;
                    ay += (vdy / vdist) * pull;
                    ax += (-vdy / vdist) * (pull * 0.75);
                    ay += (vdx / vdist) * (pull * 0.75);
                  }
                }
              }

              velX[i] = (velX[i] + ax) * 0.93;
              velY[i] = (velY[i] + ay) * 0.93;
              posX[i] += velX[i];
              posY[i] += velY[i];
            }`;

const exactOriginalPhysics = `            } else {
              if (isExactModel && shockwaves.length === 0 && vortexes.length === 0) {
                if (tdistSq > 10000.0) {
                  posX[i] = tx;
                  posY[i] = ty;
                  velX[i] = 0;
                  velY[i] = 0;
                } else if (tdistSq < 4.0) {
                  posX[i] = tx;
                  posY[i] = ty;
                  velX[i] = 0;
                  velY[i] = 0;
                } else {
                  posX[i] += (tx - posX[i]) * 0.35;
                  posY[i] += (ty - posY[i]) * 0.35;
                  velX[i] = 0;
                  velY[i] = 0;
                }
              } else {
                let dx = tx - posX[i], dy = ty - posY[i];
                const dist = Math.sqrt(dx * dx + dy * dy);
                let ds = pSpeed[i]; if (dist < 80) ds = (dist / 80) * ds;
                if (dist > 0.001) { dx = (dx / dist) * ds; dy = (dy / dist) * ds; }
                ax = dx - velX[i]; ay = dy - velY[i];
                const mag = Math.sqrt(ax * ax + ay * ay);
                if (mag > pForce[i]) { ax = (ax / mag) * pForce[i]; ay = (ay / mag) * pForce[i]; }

                if (shockwaves.length > 0) {
                  for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const sdx = posX[i] - sw.x;
                    const sdy = posY[i] - sw.y;
                    const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
                    const diff = Math.abs(sdist - sw.radius);
                    if (diff < 45 && sdist > 0.01) {
                      const bl = sw.power * (1 - diff / 45);
                      ax += (sdx / sdist) * bl;
                      ay += (sdy / sdist) * bl;
                    }
                  }
                }

                if (vortexes.length > 0) {
                  for (let v = 0; v < vortexes.length; v++) {
                    const vt = vortexes[v];
                    const vdx = vt.x - posX[i];
                    const vdy = vt.y - posY[i];
                    const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
                    const maxR = 400;
                    if (vdist < maxR && vdist > 0.1) {
                      const pull = Math.pow(1.0 - vdist / maxR, 1.5) * vt.power * 1.25;
                      ax += (vdx / vdist) * pull;
                      ay += (vdy / vdist) * pull;
                      ax += (-vdy / vdist) * (pull * 0.75);
                      ay += (vdx / vdist) * (pull * 0.75);
                    }
                  }
                }

                velX[i] = (velX[i] + ax) * 0.93;
                velY[i] = (velY[i] + ay) * 0.93;
                posX[i] += velX[i];
                posY[i] += velY[i];
              }
            }`;

if (html.includes(targetWrongPhysics)) {
  html = html.replace(targetWrongPhysics, exactOriginalPhysics);
  console.log('Successfully reverted index.html physics to original isExactModel!');
} else {
  console.log('Note: targetWrongPhysics not matched directly, checking normalized whitespace.');
  // 改行コード差の吸収
  const normHtml = html.replace(/\r\n/g, '\n');
  const normTarget = targetWrongPhysics.replace(/\r\n/g, '\n');
  const normExact = exactOriginalPhysics.replace(/\r\n/g, '\n');
  if (normHtml.includes(normTarget)) {
    html = normHtml.replace(normTarget, normExact);
    console.log('Successfully replaced normalized physics in index.html!');
  }
}

html = html.replace(/stargazer\.js\?v=[^"']*/g, 'stargazer.js?v=20260911_restored_exact');
fs.writeFileSync('index.html', html, 'utf8');

console.log('=== Step 6: Validating generated stargazer.js ===');
const s = require('./particle/stargazer.js');
const pts = s.generateStargazerTemplate(0);
console.log('Success! Total points:', pts.length);
