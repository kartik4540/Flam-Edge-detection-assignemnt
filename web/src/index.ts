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

function sobelEdgeDetection(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const result = new ImageData(width, height);
  const resultData = result.data;
  
  // Convert to grayscale first
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    gray[i/4] = y;
  }
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      // Apply Sobel kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray[idx] * sobelX[kernelIdx];
          gy += gray[idx] * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const edge = Math.min(255, magnitude);
      
      const resultIdx = (y * width + x) * 4;
      resultData[resultIdx] = edge;
      resultData[resultIdx + 1] = edge;
      resultData[resultIdx + 2] = edge;
      resultData[resultIdx + 3] = 255;
    }
  }
  
  return result;
}

async function setupWebcam() {
  const video = document.getElementById('video') as HTMLVideoElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const startBtn = document.getElementById('start') as HTMLButtonElement;
  const stopBtn = document.getElementById('stop') as HTMLButtonElement;
  const grayChk = document.getElementById('gray') as HTMLInputElement;
  const edgesChk = document.getElementById('edges') as HTMLInputElement;
  const fps = document.getElementById('fps') as HTMLSpanElement;
  const res = document.getElementById('res') as HTMLSpanElement;
  const img = document.getElementById('frame') as HTMLImageElement;
  const msg = document.getElementById('msg') as HTMLSpanElement;

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
    
    if (grayChk.checked || edgesChk.checked) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (edgesChk.checked) {
        const edgeData = sobelEdgeDetection(imageData);
        ctx.putImageData(edgeData, 0, 0);
      } else if (grayChk.checked) {
        const a = imageData.data;
        for (let i = 0; i < a.length; i += 4) {
          const y = 0.299 * a[i] + 0.587 * a[i+1] + 0.114 * a[i+2];
          a[i] = a[i+1] = a[i+2] = y;
        }
        ctx.putImageData(imageData, 0, 0);
      }
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      msg.textContent = 'getUserMedia not supported in this browser.';
      return;
    }
    try {
      msg.textContent = 'Requesting camera...';
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      msg.textContent = 'Camera started';
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        cancelAnimationFrame(raf);
        last = performance.now(); frames = 0;
        raf = requestAnimationFrame(draw);
        // Hide sample image when camera starts
        img.style.display = 'none';
      };
    } catch (e: any) {
      console.error('getUserMedia error', e);
      msg.textContent = `Error: ${e.name || ''} ${e.message || e}`;
    }
  };

  stopBtn.onclick = () => {
    if (!stream) return;
    stream.getTracks().forEach(t => t.stop());
    stream = null;
    cancelAnimationFrame(raf);
    msg.textContent = 'Camera stopped';
    // Show sample image when camera stops
    img.style.display = 'block';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupWebcam();
});