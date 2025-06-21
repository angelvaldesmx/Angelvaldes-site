// --- Función para cerrar el popup de bienvenida
window.cerrarPopup = () => {
  document.getElementById('popup-bienvenida').classList.add('oculto');
  localStorage.setItem('bienvenidaMostrada', 'true');
};

// --- Función para cerrar el popup del kit emocional
window.cerrarPopupKit = () => {
  document.getElementById('popup-kit').classList.add('oculto');
  localStorage.setItem('kitMostrado', 'true');
};

// --- Función para ir al kit emocional
window.irAlKit = () => {
  localStorage.setItem('kitMostrado', 'true');
  window.location.href = 'kit.html';
};

// --- Mostrar el popup de bienvenida si no ha sido mostrado
window.addEventListener('load', () => {
  const yaMostrada = localStorage.getItem('bienvenidaMostrada');
  if (!yaMostrada) {
    const popup = document.getElementById('popup-bienvenida');
    if (popup) popup.classList.remove('oculto');
  }

  // Mostrar banner lateral después de 25 segundos si no ha sido cerrado
  setTimeout(() => {
    const banner = document.getElementById('banner-vertical');
    const cerrado = localStorage.getItem('bannerCerrado');
    if (banner && !cerrado) banner.style.display = 'flex';
  }, 25000);

  // Escuchar click para cerrar banner y guardar preferencia
  const cerrarBtn = document.getElementById('cerrar-banner-vertical');
  if (cerrarBtn) {
    cerrarBtn.addEventListener('click', () => {
      const banner = document.getElementById('banner-vertical');
      if (banner) banner.style.display = 'none';
      localStorage.setItem('bannerCerrado', 'true');
    });
  }

  // Mostrar popup del Kit emocional a los 10 segundos si no se ha visto
  setTimeout(() => {
    if (!localStorage.getItem('kitMostrado')) {
      const popupKit = document.getElementById('popup-kit');
      if (popupKit) popupKit.classList.remove('oculto');
    }
  }, 10000);
});

// Detectar salida con mouse
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !localStorage.getItem('popupSalidaMostrado')) {
    const popupSalida = document.getElementById('popup-salida');
    if (popupSalida) {
      popupSalida.classList.remove('oculto');
      localStorage.setItem('popupSalidaMostrado', 'true');
    }
  }
});

// Detectar salida en móviles (cambio de pestaña o app)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !localStorage.getItem('popupSalidaMostrado')) {
    const popupSalida = document.getElementById('popup-salida');
    if (popupSalida) {
      popupSalida.classList.remove('oculto');
      localStorage.setItem('popupSalidaMostrado', 'true');
    }
  }
});