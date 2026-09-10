const fs = require('fs');
const readline = require('readline');

async function extractExactGirlArray() {
  const fileStream = fs.createReadStream('C:/Users/yuton/.gemini/antigravity-ide/brain/36e8f9b4-6bde-4713-ab73-98a3219dd1e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (lineIdx === 283 || lineIdx === 383) {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      const key = 'const GIRL_DATA = ';
      const start = str.indexOf(key);
      if (start !== -1) {
        // 配列の終わり '];' を探す
        const end = str.indexOf('];', start);
        if (end !== -1) {
          const rawArrayStr = str.slice(start + key.length, end + 1)
                                 .replace(/\\\\/g, '\\')
                                 .replace(/\\\"/g, '"');
          try {
            const arr = JSON.parse(rawArrayStr);
            console.log('Successfully parsed GIRL_DATA array from line ' + lineIdx + '! Count:', arr.length);
            fs.writeFileSync('scratch/original_exact_girl_array.json', JSON.stringify(arr, null, 2));
            return;
          } catch(e) {
            console.log('Parse error on line ' + lineIdx + ':', e.message);
          }
        }
      }
    }
  }
}
extractExactGirlArray();
