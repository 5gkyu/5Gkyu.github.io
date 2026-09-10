const fs = require('fs');
const readline = require('readline');

async function findGirlInObjects() {
  const fileStream = fs.createReadStream('C:/Users/yuton/.gemini/antigravity-ide/brain/36e8f9b4-6bde-4713-ab73-98a3219dd1e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    try {
      const obj = JSON.parse(line);
      const checkStr = (val) => {
        if (typeof val === 'string' && val.includes('const GIRL_DATA = [')) {
          const start = val.indexOf('const GIRL_DATA = [');
          const end = val.indexOf('];', start);
          if (start !== -1 && end !== -1) {
            const arrStr = val.slice(start + 'const GIRL_DATA = '.length, end + 1);
            try {
              const arr = JSON.parse(arrStr);
              console.log('Found GIRL_DATA in line ' + lineIdx + '! Count: ' + arr.length);
              fs.writeFileSync('scratch/original_exact_girl_array.json', JSON.stringify(arr, null, 2));
              return true;
            } catch(e) {}
          }
        }
        return false;
      };

      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.args) {
            for (const k of Object.keys(tc.args)) {
              if (checkStr(tc.args[k])) return;
            }
          }
        }
      }
      if (obj.content) checkStr(obj.content);
    } catch(e) {}
  }
}
findGirlInObjects();
