function createWelcomeMessage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 1000; // Increased height for all content
  const ctx = canvas.getContext('2d')!;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1000);
  
  // Title - smaller for mobile
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Real-Time Edge Detection', 400, 40);
  
  // Subtitle - smaller
  ctx.fillStyle = '#0088ff';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Android + OpenCV + OpenGL + Web', 400, 65);
  
  // Internship info
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('R&D Intern Assessment Project', 400, 90);
  
  // Toolkit section
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🛠️ Toolkit Used:', 50, 120);
  
  ctx.fillStyle = '#eaeaea';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const toolkit = [
    '• Android SDK (Kotlin/Java)',
    '• Camera2 API + TextureView',
    '• OpenCV C++ (JNI)',
    '• OpenGL ES 2.0',
    '• TypeScript + Canvas API',
    '• CMake + NDK'
  ];
  toolkit.forEach((item, i) => {
    ctx.fillText(item, 70, 140 + i * 18);
  });
  
  // Workflow section
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🔄 Workflow:', 50, 260);
  
  ctx.fillStyle = '#eaeaea';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const workflow = [
    '1. Camera2 captures frames → YUV',
    '2. JNI sends RGBA to OpenCV C++',
    '3. OpenCV applies Canny/Grayscale',
    '4. OpenGL ES renders texture',
    '5. Web viewer shows laptop camera'
  ];
  workflow.forEach((item, i) => {
    ctx.fillText(item, 70, 280 + i * 18);
  });
  
  // Usage instructions
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('📱 How to Use:', 50, 380);
  
  ctx.fillStyle = '#eaeaea';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const usage = [
    '• Click "Start Camera" for live feed',
    '• Click "Upload Image" for static processing',
    '• Toggle "Grayscale" for B&W conversion',
    '• Toggle "Edge Detection" for Sobel edges',
    '• Click "Save Frame" to download result',
    '• Click "Stop" to end camera session'
  ];
  usage.forEach((item, i) => {
    ctx.fillText(item, 70, 400 + i * 18);
  });
  
  // Footer
  ctx.fillStyle = '#666';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click "Start Camera" or "Upload Image" to begin', 400, 520);
  
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
  const saveBtn = document.getElementById('save') as HTMLButtonElement;
  const uploadBtn = document.getElementById('upload') as HTMLButtonElement;
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const grayChk = document.getElementById('gray') as HTMLInputElement;
  const edgesChk = document.getElementById('edges') as HTMLInputElement;
  const fps = document.getElementById('fps') as HTMLSpanElement;
  const res = document.getElementById('res') as HTMLSpanElement;
  const img = document.getElementById('frame') as HTMLImageElement;
  const msg = document.getElementById('msg') as HTMLSpanElement;

  // show welcome message
  img.src = createWelcomeMessage();
  img.onload = () => {
    res.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
    fps.textContent = 'N/A';
  };

  let stream: MediaStream | null = null;
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let isUploadMode = false;
  let originalImageData: ImageData | null = null;

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

  function processUploadedImage(imageFile: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the uploaded image
        ctx.drawImage(img, 0, 0);
        
        // Store the original image data
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply processing if enabled
        if (grayChk.checked || edgesChk.checked) {
          applyProcessing();
        }
        
        // Update stats
        res.textContent = `${canvas.width}x${canvas.height}`;
        fps.textContent = 'Static';
        msg.textContent = 'Image processed';
        
        // Hide welcome message
        const welcomeImg = document.getElementById('frame') as HTMLImageElement;
        welcomeImg.style.display = 'none';
        
        // Enable save button
        saveBtn.disabled = false;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  }

  function applyProcessing() {
    if (!originalImageData) return;
    
    // Restore original image first
    ctx.putImageData(originalImageData, 0, 0);
    
    // Apply current processing
    if (edgesChk.checked) {
      const edgeData = sobelEdgeDetection(originalImageData);
      ctx.putImageData(edgeData, 0, 0);
    } else if (grayChk.checked) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const a = imageData.data;
      for (let i = 0; i < a.length; i += 4) {
        const y = 0.299 * a[i] + 0.587 * a[i+1] + 0.114 * a[i+2];
        a[i] = a[i+1] = a[i+2] = y;
      }
      ctx.putImageData(imageData, 0, 0);
    }
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
        // Hide welcome message when camera starts
        img.style.display = 'none';
        // Enable stop and save buttons
        startBtn.disabled = true;
        stopBtn.disabled = false;
        saveBtn.disabled = false;
        uploadBtn.disabled = true;
        isUploadMode = false;
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
    // Show welcome message when camera stops
    img.style.display = 'block';
    // Enable start button, disable stop and save buttons
    startBtn.disabled = false;
    stopBtn.disabled = true;
    saveBtn.disabled = true;
    uploadBtn.disabled = false;
    isUploadMode = false;
  };

  uploadBtn.onclick = () => {
    fileInput.click();
  };

  fileInput.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      processUploadedImage(file);
      isUploadMode = true;
      // Disable camera controls when in upload mode
      startBtn.disabled = true;
      stopBtn.disabled = true;
      uploadBtn.disabled = true;
    }
  };

  // Add event listeners for processing toggles
  grayChk.onchange = () => {
    if (isUploadMode && canvas.width > 0 && canvas.height > 0) {
      applyProcessing();
    }
  };

  edgesChk.onchange = () => {
    if (isUploadMode && canvas.width > 0 && canvas.height > 0) {
      applyProcessing();
    }
  };

  saveBtn.onclick = () => {
    if (canvas.width === 0 || canvas.height === 0) return;
    
    // Create a temporary canvas to capture the current frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Draw the current processed frame
    tempCtx.drawImage(canvas, 0, 0);
    
    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = isUploadMode ? 'uploaded-image' : 'edge-detection';
      a.download = `${prefix}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      msg.textContent = 'Frame saved!';
      setTimeout(() => {
        if (stream) msg.textContent = 'Camera started';
        else if (isUploadMode) msg.textContent = 'Image processed';
        else msg.textContent = 'Ready';
      }, 2000);
    }, 'image/png');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupWebcam();
});