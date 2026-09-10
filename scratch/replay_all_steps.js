const { execSync } = require('child_process');
const fs = require('fs');

const steps = [
  'update_stargazer.js',
  'apply_visible_water.js',
  'apply_semicircle_water.js',
  'apply_clean_water.js',
  'apply_boundary_elimination.js',
  'apply_precise_falloff.js',
  'apply_lines_replacement.js',
  'rebuild_clean_stargazer.js',
  'apply_epic_night_sky.js',
  'apply_diverse_stars.js'
];

steps.forEach((step, idx) => {
  console.log(`=== Step ${idx + 1}: ${step} ===`);
  const scriptPath = `scratch/${step}`;
  if (fs.existsSync(scriptPath)) {
    // スクリプトの中身が particle/stargazer.js を対象にしているか確認
    try {
      const out = execSync(`node ${scriptPath}`, { cwd: process.cwd() }).toString();
      console.log(out.trim());
    } catch (err) {
      console.error(`Error in step ${step}:`, err.message);
      if (err.stdout) console.log('Stdout:', err.stdout.toString());
      if (err.stderr) console.log('Stderr:', err.stderr.toString());
      process.exit(1);
    }
  } else {
    console.error(`File not found: ${scriptPath}`);
    process.exit(1);
  }
});

console.log('=== All 10 steps replayed successfully! ===');
