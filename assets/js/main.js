document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // 1. LÓGICA DEL MENÚ MÓVIL & SIDEBAR
    // =========================================================
    const body = document.body;
    const collapseBtn = document.getElementById("sidebar-collapse-btn");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");

    // Función para abrir/cerrar menú móvil
    function toggleMobileMenu() {
        const isOpen = body.classList.contains("mobile-menu-open");
        
        if (isOpen) {
            body.classList.remove("mobile-menu-open");
            body.style.overflow = ''; // Reactivar scroll
        } else {
            body.classList.add("mobile-menu-open");
            body.style.overflow = 'hidden'; // Bloquear scroll de fondo
        }
    }

    // Función para colapsar en desktop
    function toggleDesktopCollapse() {
        body.classList.toggle("sidebar-collapsed");
    }

    // EVENTOS

    // A. Botón Hamburguesa (Móvil)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que el clic se propague
            toggleMobileMenu();
        });
    }

    // B. Botón Colapsar (Dentro del Sidebar)
    if (collapseBtn) {
        collapseBtn.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu(); // En móvil, actúa como cerrar
            } else {
                toggleDesktopCollapse(); // En desktop, colapsa
            }
        });
    }

    // C. CERRAR AL DAR CLIC AFUERA (Overlay) - ¡EL FIX CLAVE!
    document.addEventListener("click", (e) => {
        // Si el menú está abierto Y el clic NO fue en el sidebar NI en el botón
        if (body.classList.contains("mobile-menu-open")) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                toggleMobileMenu(); // Cerrar
            }
        }
    });

    // D. CERRAR AL DAR CLIC EN UN LINK (UX Pro)
    // Si el usuario navega, el menú debe cerrarse solo
    const sidebarLinks = document.querySelectorAll('.sidebar-section a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                body.classList.remove("mobile-menu-open");
                body.style.overflow = '';
            }
        });
    });


    // =========================================================
    // 2. LÓGICA DE MODALES (Privacidad / Términos)
    // =========================================================
    
    // Exponemos estas funciones al objeto window para usarlas en el HTML (onclick)
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex'; // Primero display flex
            // Pequeño timeout para permitir la transición de opacidad
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Espera a que termine la animación
            document.body.style.overflow = '';
        }
    };

    // Cerrar modal al dar clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        }
    });


    // =========================================================
    // 3. LÓGICA NEWSLETTER (FIX NETLIFY)
    // =========================================================
    const newsletterForm = document.getElementById("newsletter-form");
    
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const myForm = event.target;
            const formData = new FormData(myForm);
            const submitButton = myForm.querySelector('button[type="submit"]');
            const emailInput = myForm.querySelector('input[type="email"]');
            const originalButtonText = submitButton.innerHTML;

            // 1. Feedback visual
            submitButton.innerHTML = 'Enviando...';
            submitButton.disabled = true;

            // 2. Preparar datos para Netlify (UrlEncoded)
            // Este es el truco para que Netlify lo acepte vía AJAX
            const data = new URLSearchParams(formData).toString();

            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data,
            })
            .then(() => {
                // ¡ÉXITO!
                submitButton.innerHTML = '<i class="fa-solid fa-check"></i> ¡Listo!';
                submitButton.style.backgroundColor = "#1DB954"; // Verde éxito
                emailInput.value = "";
            })
            .catch((error) => {
                // ERROR
                console.error("Error:", error);
                submitButton.innerHTML = 'Error al enviar';
                submitButton.style.backgroundColor = "red";
            })
            .finally(() => {
                // 3. Resetear botón a los 3 segundos
                setTimeout(() => {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.style.backgroundColor = ""; // Restaurar color original
                    submitButton.disabled = false;
                }, 3000);
            });
        });
    }

}); // Fin del DOMContentLoaded
