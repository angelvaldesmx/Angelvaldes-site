
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

// --- Al cargarse la página ---
window.addEventListener('DOMContentLoaded', () => {
  const bienvenida = document.getElementById('popup-bienvenida');
  const kit = document.getElementById('popup-kit');
  const banner = document.getElementById('banner-vertical');
  const cerrarBannerBtn = document.getElementById('cerrar-banner-vertical');
  const buscarBtn = document.getElementById("buscarBtn");

  if (!localStorage.getItem('bienvenidaMostrada') && bienvenida) {
    bienvenida.classList.remove('oculto');
  }

  if (!localStorage.getItem('kitMostrado') && kit) {
    setTimeout(() => kit.classList.remove('oculto'), 10000);
  }

  if (!localStorage.getItem('bannerCerrado') && banner) {
    setTimeout(() => banner.style.display = 'flex', 25000);
  }

  if (cerrarBannerBtn && banner) {
    cerrarBannerBtn.addEventListener('click', () => {
      banner.style.display = 'none';
      localStorage.setItem('bannerCerrado', 'true');
    });
  }

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

// --- Buscar productos en Amazon (demo) ---
async function buscar() {
  const termino = document.getElementById("termino").value.trim();
  const resDiv = document.getElementById("resultado");
  if (!termino) return;

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
            <img src="${p.image}" alt="${p.title}" style="width:100%; border-radius:8px;" />
            <p>${p.title.slice(0, 45)}...</p>
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
