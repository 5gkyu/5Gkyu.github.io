const form = document.getElementById('genForm');
const promptEl = document.getElementById('prompt');
const widthEl = document.getElementById('width');
const heightEl = document.getElementById('height');
const seedEl = document.getElementById('seed');
const statusEl = document.getElementById('status');
const resultFrame = document.getElementById('resultFrame');
const openImage = document.getElementById('openImage');
const randomPromptBtn = document.getElementById('randomPrompt');

const samples = [
  'anime style girl with umbrella in rain, soft lighting, detailed background',
  'pixel art fantasy village, isometric view, colorful, high detail',
  'futuristic robot portrait, studio lighting, photorealistic',
  'cozy japanese cafe interior, warm tone, cinematic composition'
];

function buildUrl({ prompt, width, height, seed }) {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const params = new URLSearchParams();
  params.set('width', width);
  params.set('height', height);
  params.set('nologo', 'true');
  if (seed !== '') params.set('seed', seed);
  return `https://pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

randomPromptBtn.addEventListener('click', () => {
  promptEl.value = samples[Math.floor(Math.random() * samples.length)];
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const prompt = promptEl.value;
  if (!prompt.trim()) {
    setStatus('プロンプトを入力してください。');
    return;
  }

  const width = String(Math.min(1536, Math.max(256, Number(widthEl.value) || 1024)));
  const height = String(Math.min(1536, Math.max(256, Number(heightEl.value) || 1024)));
  const seed = seedEl.value.trim();

  const url = buildUrl({ prompt, width, height, seed });

  setStatus('生成中...（数秒〜十数秒かかる場合があります）');

  resultFrame.onload = () => {
    setStatus('生成完了');
  };

  resultFrame.onerror = () => {
    setStatus('生成に失敗しました。プロンプトを変更して再試行してください。');
  };

  resultFrame.src = url;
  openImage.href = url;
});
