window.cerrarPopup = () => {
  const popup = document.getElementById('popup-bienvenida');
  popup.classList.add('oculto');
  localStorage.setItem('bienvenidaMostrada', 'true');
};

window.addEventListener('DOMContentLoaded', () => {
  const yaMostrada = localStorage.getItem('bienvenidaMostrada');
  if (!yaMostrada) {
    document.getElementById('popup-bienvenida').classList.remove('oculto');
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !localStorage.getItem('popupSalidaMostrado')) {
    document.getElementById('popup-salida').classList.remove('oculto');
    localStorage.setItem('popupSalidaMostrado', 'true');
  }
});

window.cerrarPopupKit = () => {
  document.getElementById('popup-kit').classList.add('oculto');
  localStorage.setItem('kitMostrado', 'true');
};

window.irAlKit = () => {
  localStorage.setItem('kitMostrado', 'true');
  window.location.href = 'kit.html';
};

// Mostrar el popup del Kit emocional a los 10s si no ha sido visto
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!localStorage.getItem('kitMostrado')) {
      document.getElementById('popup-kit').classList.remove('oculto');
    }
  }, 10000);
});
