const imgBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAACEN3D/AAAAEElEQVQYV2NkYGD4z0AEYwAAUQABJmK6XfEAAAAASUVORK5CYII=';

function render() {
  const img = document.getElementById('frame') as HTMLImageElement;
  const fps = document.getElementById('fps') as HTMLSpanElement;
  const res = document.getElementById('res') as HTMLSpanElement;
  if (img) {
    img.src = imgBase64;
    img.onload = () => {
      res.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
      fps.textContent = 'N/A';
    };
  }
}

document.addEventListener('DOMContentLoaded', render);


