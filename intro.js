const redirigir = (destino = 'index') => {
  localStorage.setItem('introVisto', 'true');
  window.location.href = `${destino}.html`;
};

document.getElementById("cerrarIntro").addEventListener("click", () => {
  redirigir();
});

window.onload = () => {
  const obj = document.getElementById("svgIntro");
  if (!obj) return;

  obj.addEventListener("load", () => {
    const svgDoc = obj.contentDocument;
    if (svgDoc) {
      const svg = svgDoc.querySelector("svg");
      if (svg) svg.classList.add("active");
    }
  });

  // Redirigir automáticamente después de 7 segundos
  setTimeout(() => redirigir(), 7000);
};