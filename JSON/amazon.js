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

function buscar() {
  const termino = document.getElementById("termino").value.trim().toLowerCase();
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  if (!termino) {
    resultadoDiv.innerHTML = "<p class='mensaje'>Por favor, escribe un término para buscar.</p>";
    return;
  }

  const resultadosFiltrados = productosSimulados.filter(p => p.titulo.toLowerCase().includes(termino));

  if (resultadosFiltrados.length === 0) {
    resultadoDiv.innerHTML = `<p class='mensaje'>No encontramos productos para "<strong>${termino}</strong>". Intenta otro término.</p>`;
    return;
  }

  resultadosFiltrados.forEach(prod => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.titulo}" loading="lazy">
      <h3>${prod.titulo}</h3>
      <p class="precio">${prod.precio}</p>
      <a href="${prod.enlace}" target="_blank" rel="noopener noreferrer" class="btn-comprar">Comprar</a>
    `;
    resultadoDiv.appendChild(card);
  });
}

document.getElementById("buscarBtn").addEventListener("click", buscar);
