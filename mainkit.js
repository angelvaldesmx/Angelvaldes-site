#// --- Funciones globales
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
// Simulación de productos (reemplaza con llamada API real cuando la tengas)
const productosSimulados = [
  {
    titulo: "Auriculares Bluetooth XYZ",
    precio: "$499",
    imagen: "https://via.placeholder.com/150",
    enlace: "https://www.amazon.com.mx/dp/PRODUCT_ID_1"
  },
  {
    titulo: "Smartwatch Deportivo ABC",
    precio: "$1299",
    imagen: "https://via.placeholder.com/150",
    enlace: "https://www.amazon.com.mx/dp/PRODUCT_ID_2"
  },
  {
    titulo: "Cargador USB-C Rápido",
    precio: "$199",
    imagen: "https://via.placeholder.com/150",
    enlace: "https://www.amazon.com.mx/dp/PRODUCT_ID_3"
  }
];
 
async function buscar() {
  const termino = document.getElementById("termino").value.trim();
  if (!termino) return;
  const resDiv = document.getElementById("resultado");
  resDiv.innerHTML = "🔄 Buscando...";
  try {
    const resp = await fetch(`/.netlify/functions/amazon-product?term=${encodeURIComponent(termino)}`);
    const data = await resp.json();
    if (!data.search_results?.length) {
      resDiv.innerHTML = `<p style="color:#ff5e5e;">No se encontraron resultados 😔</p>`;
      return;
    }
    let html = `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1em;">`;
    data.search_results.slice(0, 6).forEach(p => {
      html += `
        <div style="background:#1a1a1a; padding:1em; border-radius:10px; text-align:center;">
          <a href="${p.link}&tag=onamzang0e928-20" target="_blank" rel="noopener" style="color:#00ffab;text-decoration:none;">
            <img src="${p.image}" alt="${p.title}" style="width:100%; border-radius:8px;"/>
            <p>${p.title.slice(0,45)}...</p>
          </a>
          <p style="color:#ccc;font-weight:bold;">${p.price?.raw || '—'}</p>
        </div>`;
    });
    html += `</div>`;
    resDiv.innerHTML = html;
  } catch (err) {
    console.error(err);
    resDiv.innerHTML = `<p style="color:#ff5e5e;">Error al buscar productos.</p>`;
  }
}

// Fuera de la función, después de declararla:
document.getElementById("buscarBtn").addEventListener("click", buscar);