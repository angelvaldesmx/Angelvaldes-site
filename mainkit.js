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

#amazon-afiliados {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 10px;
  color: #eee;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 0 10px rgba(0,255,171,0.15);
}

#amazon-afiliados h2 {
  font-size: 1.8rem;
  color: #00ffab;
  text-align: center;
  margin-bottom: 1rem;
}

#amazon-afiliados input[type="text"] {
  width: 70%;
  padding: 0.5rem;
  border-radius: 5px 0 0 5px;
  border: none;
  font-size: 1rem;
  outline: none;
  color: #000;
}

#amazon-afiliados button {
  width: 28%;
  padding: 0.5rem;
  border-radius: 0 5px 5px 0;
  border: none;
  background: #00ffab;
  color: #000;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#amazon-afiliados button:hover {
  background: #00d298;
}

#resultado {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
  gap: 1rem;
}

.producto-card {
  background: #292929;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 6px rgba(0,255,171,0.3);
  transition: transform 0.2s ease;
}

.producto-card:hover {
  transform: translateY(-5px);
}

.producto-card img {
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  height: 140px;
  object-fit: cover;
}

.producto-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  color: #00ffab;
}

.precio {
  font-weight: bold;
  margin-bottom: 0.6rem;
}

.btn-comprar {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #00ffab;
  color: #000;
  font-weight: bold;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.btn-comprar:hover {
  background: #00d298;
}

.mensaje {
  color: #aaa;
  font-style: italic;
  text-align: center;
  grid-column: 1/-1;
}

/* Responsive */

@media (max-width: 480px) {
  #amazon-afiliados input[type="text"],
  #amazon-afiliados button {
    width: 100%;
    border-radius: 5px;
    margin-bottom: 0.5rem;
  }

  #resultado {
    grid-template-columns: 1fr;
  }
}


