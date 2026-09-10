const fs = require('fs');
const readline = require('readline');

async function extractGirlData() {
  const fileStream = fs.createReadStream('C:/Users/yuton/.gemini/antigravity-ide/brain/36e8f9b4-6bde-4713-ab73-98a3219dd1e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (lineIdx === 354 || lineIdx === 383) {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      const startIdx = str.indexOf('const GIRL_DATA = [');
      if (startIdx !== -1) {
        const endIdx = str.indexOf('];', startIdx);
        const girlStr = str.slice(startIdx, endIdx + 2).replace(/\\\\/g, '\\').replace(/\\\"/g, '"');
        fs.writeFileSync('scratch/original_girl_data_' + lineIdx + '.js', girlStr);
        console.log('Saved GIRL_DATA from line ' + lineIdx + ' (length: ' + girlStr.length + ')');
      }
    }
  }
}
extractGirlData();
