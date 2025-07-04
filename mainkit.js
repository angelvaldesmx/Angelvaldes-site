<script>
  if (!localStorage.getItem('introVisto')) {
    // Redirige a la intro antes de mostrar esta página
    window.location.href = 'intro.html';
  }
</script>

// --- Funciones globales ---
window.cerrarPopup = () => {
  const popup = document.getElementById('popup-bienvenida');
  if (popup) {
    popup.classList.add('oculto');
    localStorage.setItem('bienvenidaMostrada', 'true');
  }
};

window.cerrarPopupKit = () => {
  const popup = document.getElementById('popup-kit');
  if (popup) {
    popup.classList.add('oculto');
    localStorage.setItem('kitMostrado', 'true');
  }
};

window.irAlKit = () => {
  localStorage.setItem('kitMostrado', 'true');
  window.location.href = 'kit.html';
};

window.cerrarPopupSalida = () => {
  const salida = document.getElementById('popup-salida');
  if (salida) {
    salida.classList.add('oculto');
    localStorage.setItem('popupSalidaMostrado', 'true');
  }
};

// --- Al cargarse la página ---
window.addEventListener('DOMContentLoaded', () => {
  // Bienvenida
  const bienvenida = document.getElementById('popup-bienvenida');
  if (!localStorage.getItem('bienvenidaMostrada') && bienvenida) {
    bienvenida.classList.remove('oculto');
  }

  // Popup Kit (después de 10s)
  const kit = document.getElementById('popup-kit');
  if (!localStorage.getItem('kitMostrado') && kit) {
    setTimeout(() => {
      kit.classList.remove('oculto');
    }, 10000);
  }

  // Banner (después de 25s)
  const banner = document.getElementById('banner-vertical');
  if (!localStorage.getItem('bannerCerrado') && banner) {
    setTimeout(() => {
      banner.classList.remove('oculto');
      banner.style.display = 'flex';
    }, 25000);
  }

  // Botón cerrar banner
  const cerrarBannerBtn = document.getElementById('cerrar-banner-vertical');
  if (cerrarBannerBtn && banner) {
    cerrarBannerBtn.addEventListener('click', () => {
      banner.classList.add('oculto');
      banner.style.display = 'none';
      localStorage.setItem('bannerCerrado', 'true');
    });
  }

  // Búsqueda Amazon
  const buscarBtn = document.getElementById("buscarBtn");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", buscar);
  }
});

// --- Popup de salida ---
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !localStorage.getItem('popupSalidaMostrado')) {
    const salida = document.getElementById('popup-salida');
    if (salida) {
      salida.classList.remove('oculto');
      localStorage.setItem('popupSalidaMostrado', 'true');
    }
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !localStorage.getItem('popupSalidaMostrado')) {
    const salida = document.getElementById('popup-salida');
    if (salida) {
      salida.classList.remove('oculto');
      localStorage.setItem('popupSalidaMostrado', 'true');
    }
  }
});

async function buscar() {
  const termino = document.getElementById("termino").value.trim().toLowerCase();
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "🔄 Buscando...";

  if (!termino) {
    resultadoDiv.innerHTML = `<p class='mensaje'>Escribe algo para buscar.</p>`;
    return;
  }

  try {
    const resp = await fetch(`/.netlify/functions/amazon-product?term=${encodeURIComponent(termino)}`);
    const data = await resp.json();

    if (!data.search_results?.length) throw new Error("Sin resultados");

    // Mostrar resultados de la API
    resultadoDiv.innerHTML = `
      <div style="display: flex; overflow-x: auto; gap: 1rem; scroll-snap-type: x mandatory;">
        ${data.search_results.slice(0, 5).map(p => `
          <div style="flex: 0 0 auto; scroll-snap-align: start; background:#1a1a1a; padding:1em; border-radius:10px; text-align:center; width:180px;">
            <a href="${p.link}&tag=onamzang0e928-20" target="_blank" rel="noopener" style="color:#00ffab; text-decoration:none;">
              <img src="${p.image}" alt="${p.title}" style="width:100%; border-radius:8px;" />
              <p>${p.title.slice(0, 50)}...</p>
            </a>
            <p style="color:#ccc; font-weight:bold;">${p.price?.raw || '—'}</p>
          </div>
        `).join("")}
      </div>
    `;

  } catch (err) {
    console.warn("Usando productos simulados como respaldo");

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
      },
      {
        titulo: "Power Bank 10000mAh",
        precio: "$379",
        imagen: "https://via.placeholder.com/150",
        enlace: "https://www.amazon.com.mx/dp/PRODUCT_ID_4"
      },
      {
        titulo: "Teclado inalámbrico LED",
        precio: "$850",
        imagen: "https://via.placeholder.com/150",
        enlace: "https://www.amazon.com.mx/dp/PRODUCT_ID_5"
      }
    ];

    resultadoDiv.innerHTML = `
      <div style="display: flex; overflow-x: auto; gap: 1rem; scroll-snap-type: x mandatory;">
        ${productosSimulados.map(prod => `
          <div style="flex: 0 0 auto; scroll-snap-align: start; background:#1a1a1a; padding:1em; border-radius:10px; text-align:center; width:180px;">
            <a href="${prod.enlace}" target="_blank" rel="noopener" style="color:#00ffab; text-decoration:none;">
              <img src="${prod.imagen}" alt="${prod.titulo}" style="width:100%; border-radius:8px;" />
              <p>${prod.titulo}</p>
            </a>
            <p style="color:#ccc; font-weight:bold;">${prod.precio}</p>
          </div>
        `).join("")}
      </div>
      <div style="text-align:center; font-size:0.85rem; color:#888; margin-top:0.5rem;">
        ⬅️ Desliza para ver más ➡️
      </div>
    `;
  }
}
