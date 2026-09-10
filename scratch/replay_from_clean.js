const fs = require('fs');
const { execSync } = require('child_process');

console.log('1. Copying initial_stargazer.js to particle/stargazer.js...');
fs.copyFileSync('scratch/initial_stargazer.js', 'particle/stargazer.js');

const scripts = [
  'scratch/apply_boundary_elimination.js',
  'scratch/apply_precise_falloff.js',
  'scratch/apply_lines_replacement.js',
  'scratch/rebuild_clean_stargazer.js',
  'scratch/apply_epic_night_sky.js',
  'scratch/apply_diverse_stars.js'
];

for (const s of scripts) {
  if (fs.existsSync(s)) {
    console.log(`Running ${s}...`);
    try {
      const out = execSync(`node ${s}`, { cwd: process.cwd() }).toString();
      console.log('  ' + out.trim());
    } catch(e) {
      console.error('Error running ' + s + ':', e.message);
      if (e.stdout) console.log('Stdout:', e.stdout.toString());
      if (e.stderr) console.log('Stderr:', e.stderr.toString());
      process.exit(1);
    }
  } else {
    console.log(`Script not found: ${s}, skipping.`);
  }
}

console.log('Done replay!');
