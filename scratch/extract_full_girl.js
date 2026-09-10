const fs = require('fs');
const readline = require('readline');

async function findFullGirlData() {
  const fileStream = fs.createReadStream('C:/Users/yuton/.gemini/antigravity-ide/brain/36e8f9b4-6bde-4713-ab73-98a3219dd1e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (line.includes('const GIRL_DATA = [') && line.length > 50000) {
      console.log('Found full GIRL_DATA in line ' + lineIdx + ' (length: ' + line.length + ')');
      const start = line.indexOf('const GIRL_DATA = [');
      const end = line.indexOf('];', start);
      if (start !== -1 && end !== -1) {
        const girlCode = line.slice(start, end + 2).replace(/\\\\/g, '\\').replace(/\\\"/g, '"');
        fs.writeFileSync('scratch/exact_girl_data.js', girlCode);
        console.log('Extracted exact GIRL_DATA successfully!');
        break;
      }
    }
  }
}
findFullGirlData();
