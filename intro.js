// Función para redireccionar al destino
function redirigir(destino) {
  // Guardamos que el usuario ya vio la intro
  localStorage.setItem('introVisto', 'true');
  window.location.href = destino + ".html";
}

// Maneja el clic en "Saltar Intro"
document.getElementById("cerrarIntro").addEventListener("click", () => {
  document.getElementById("introContainer").classList.add("ocultar");
});

// Esperamos a que cargue el SVG y luego aplicamos clase "active"
window.onload = () => {
  const obj = document.getElementById("svgIntro");
  if (!obj) return;

  // Escuchar cuando se cargue completamente el contenido SVG
  obj.addEventListener("load", () => {
    const svgDoc = obj.contentDocument;
    if (svgDoc) {
      const svg = svgDoc.querySelector("svg");
      if (svg) svg.classList.add("active");
    }
  });
};
