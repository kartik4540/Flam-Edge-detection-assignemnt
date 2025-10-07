function makeCheckerPng(size = 256, cell = 16): string {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const on = ((x / cell) + (y / cell)) % 2 === 0;
      ctx.fillStyle = on ? '#00ff88' : '#101010';
      ctx.fillRect(x, y, cell, cell);
    }
  }
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

async function setupWebcam() {
  const video = document.getElementById('video') as HTMLVideoElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const startBtn = document.getElementById('start') as HTMLButtonElement;
  const stopBtn = document.getElementById('stop') as HTMLButtonElement;
  const grayChk = document.getElementById('gray') as HTMLInputElement;
  const fps = document.getElementById('fps') as HTMLSpanElement;
  const res = document.getElementById('res') as HTMLSpanElement;
  const img = document.getElementById('frame') as HTMLImageElement;

  // show a default sample image
  img.src = makeCheckerPng(256, 16);
  img.onload = () => {
    res.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
    fps.textContent = 'N/A';
  };

  let stream: MediaStream | null = null;
  let raf = 0;
  let last = performance.now();
  let frames = 0;

  function draw() {
    if (!video.videoWidth || !video.videoHeight) {
      raf = requestAnimationFrame(draw);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (grayChk.checked) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const a = imageData.data;
      for (let i = 0; i < a.length; i += 4) {
        const y = 0.299 * a[i] + 0.587 * a[i+1] + 0.114 * a[i+2];
        a[i] = a[i+1] = a[i+2] = y;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      const fpsVal = (frames * 1000) / (now - last);
      fps.textContent = fpsVal.toFixed(1);
      res.textContent = `${canvas.width}x${canvas.height}`;
      frames = 0; last = now;
    }
    raf = requestAnimationFrame(draw);
  }

  startBtn.onclick = async () => {
    if (stream) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      cancelAnimationFrame(raf);
      last = performance.now(); frames = 0;
      raf = requestAnimationFrame(draw);
    };
  };

  stopBtn.onclick = () => {
    if (!stream) return;
    stream.getTracks().forEach(t => t.stop());
    stream = null;
    cancelAnimationFrame(raf);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupWebcam();
});


