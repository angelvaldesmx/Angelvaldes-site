// --- Funciones globales
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

// --- Al cargarse la página
window.addEventListener('DOMContentLoaded', () => {
  // Bienvenida
  if (!localStorage.getItem('bienvenidaMostrada')) {
    document.getElementById('popup-bienvenida')?.classList.remove('oculto');
  }
  // Banner
  setTimeout(() => {
    if (!localStorage.getItem('bannerCerrado')) {
      document.getElementById('banner-vertical')?.style.removeProperty('display');
    }
  }, 25000);
  // Botón cerrar banner
  document.getElementById('cerrar-banner-vertical')?.addEventListener('click', () => {
    document.getElementById('banner-vertical').style.display = 'none';
    localStorage.setItem('bannerCerrado', 'true');
  });
  // Popup kit
  setTimeout(() => {
    if (!localStorage.getItem('kitMostrado')) {
      document.getElementById('popup-kit')?.classList.remove('oculto');
    }
  }, 10000);
});

// --- Detectar salida de pestaña o intentos de cierre
document.addEventListener('mouseleave', e => {
  if (e.clientY <= 0 && !localStorage.getItem('popupSalidaMostrado')) {
    document.getElementById('popup-salida')?.classList.remove('oculto');
    localStorage.setItem('popupSalidaMostrado', 'true');
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !localStorage.getItem('popupSalidaMostrado')) {
    document.getElementById('popup-salida')?.classList.remove('oculto');
    localStorage.setItem('popupSalidaMostrado', 'true');
  }
});