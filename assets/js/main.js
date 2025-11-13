// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const collapseBtn = document.getElementById("sidebar-collapse-btn");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  // ----- LÓGICA UNIFICADA DE TOGGLE -----
  
  function toggleMobileMenu() {
    body.classList.toggle("mobile-menu-open");
  }

  function toggleDesktopCollapse() {
    body.classList.toggle("sidebar-collapsed");
    // Opcional: Guardar preferencia
    // localStorage.setItem("sidebarCollapsed", body.classList.contains("sidebar-collapsed"));
  }

  // ----- EVENTOS -----

  // 1. Botón Hamburguesa (Móvil)
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  // 2. Botón de Colapsar (Sidebar)
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      // Checa si estamos en móvil o desktop
      if (window.innerWidth <= 768) {
        toggleMobileMenu(); // Cierra el menú móvil
      } else {
        toggleDesktopCollapse(); // Colapsa el menú desktop
      }
    });
  }
  
  // 3. Opcional: Clic en el overlay para cerrar (si creamos el overlay)
  // (Lógica pendiente para el overlay)

  // Opcional: Cargar preferencia de colapso en Desktop
  // if (localStorage.getItem("sidebarCollapsed") === "true") {
  //   body.classList.add("sidebar-collapsed");
  // }
});
// ----- LÓGICA NEWSLETTER (NETLIFY FORMS) -----
    const newsletterForm = document.getElementById("newsletter-form");
    
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // ¡Stop al reload!

            const form = event.target;
            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const emailInput = form.querySelector('input[type="email"]');
            const originalButtonText = submitButton.innerHTML;

            // 1. Feedback visual (Look Premium)
            submitButton.innerHTML = 'Enviando...';
            submitButton.disabled = true;

            try {
                // 2. Envío directo a Netlify (sin función backend extra)
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString(),
                });

                if (response.ok) {
                    // ¡ÉXITO!
                    submitButton.innerHTML = '<i class="fa-solid fa-check"></i> ¡Listo!';
                    emailInput.value = ''; // Limpiar campo
                } else {
                    throw new Error('Error en la conexión');
                }

            } catch (error) {
                // ¡ERROR!
                submitButton.innerHTML = 'Error';
                console.error("Error:", error);
            }

            // 3. Resetear botón
            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }, 3000);
        });
    }
/* =========================================
   LÓGICA DE MODALES
   (Pega esto en main.js)
========================================= */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita scroll en la página de fondo
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Reactiva el scroll
    }
}

// Cerrar al dar clic fuera del contenido (en el overlay)
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
