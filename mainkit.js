window.cerrarPopup = () => {
  document.getElementById('popup-bienvenida').classList.add('oculto');
  localStorage.setItem('bienvenidaMostrada', 'true');
};

window.cerrarPopupKit = () => {
  document.getElementById('popup-kit').classList.add('oculto');
  localStorage.setItem('kitMostrado', 'true');
};

window.irAlKit = () => {
  localStorage.setItem('kitMostrado', 'true');
  window.location.href = 'kit.html';
};

// Mostrar popup bienvenida al cargar si no ha sido mostrado
window.addEventListener('DOMContentLoaded', () => {
  const yaMostrada = localStorage.getItem('bienvenidaMostrada');
  if (!yaMostrada) {
    document.getElementById('popup-bienvenida').classList.remove('oculto');
  }

  

// Mostrar popup del Kit a los 10 segundos si no ha sido visto
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!localStorage.getItem('kitMostrado')) {
      document.getElementById('popup-kit').classList.remove('oculto');
    }
  }, 10000);
});
// Mostrar banner lateral a los 25 segundos
  setTimeout(() => {
    const banner = document.getElementById('banner-vertical');
    if (banner) banner.style.display = 'flex';
  }, 25000);

  const cerrarBtn = document.getElementById('cerrar-banner-vertical');
  if (cerrarBtn) {
    cerrarBtn.addEventListener('click', () => {
      document.getElementById('banner-vertical').style.display = 'none';
    });
  }
});
// Mostrar popup de salida si intenta abandonar la pestaña
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !localStorage.getItem('popupSalidaMostrado')) {
    document.getElementById('popup-salida').classList.remove('oculto');
    localStorage.setItem('popupSalidaMostrado', 'true');
  }
});
