document.addEventListener('DOMContentLoaded', () => {
  const introContainer = document.querySelector('.intro-container');
  const cerrarBtn = document.getElementById('cerrarIntro');
  const grid = document.querySelector('.window-grid');
  const frase = document.querySelector('.frase');

  // Mostrar contenido después de 7 segundos
  setTimeout(() => {
    introContainer.classList.add('intro-mostrado');
    localStorage.setItem('introVisto', true);
    if (frase) frase.style.opacity = 1;
  }, 7000);

  // Si presiona cerrar
  cerrarBtn.addEventListener('click', () => {
    introContainer.classList.add('intro-mostrado');
    localStorage.setItem('introVisto', true);
    if (frase) frase.style.opacity = 1;
  });
});

function redirigir(pagina) {
  window.location.href = `${pagina}.html`;
}
