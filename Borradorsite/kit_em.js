// ======== VARIABLES GLOBALES ========
let lastScrollTop = 0;
let kitDescargado = false;
let nombreUsuario = "";

// ======== NAVBAR HIDE/SHOW AL SCROLL ========
const navbar = document.querySelector('.navbar');
// Reimplementamos la lógica de ocultar/mostrar la navbar
window.addEventListener('scroll', () => {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
        // Scroll hacia abajo
        navbar.style.top = '-80px';
    } else {
        // Scroll hacia arriba
        navbar.style.top = '0';
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

// ======== MODALES (Descarga y Comentarios) ========
const btnObtenerKit = document.getElementById('btn-obtener-kit');
const modalDescarga = document.getElementById('modal-descarga');
const modalStep1 = document.getElementById('modal-step-1');
const modalStep2 = document.getElementById('modal-step-2');
const btnComentariosModal = document.getElementById('btn-comentarios-modal');
const modalComentarios = document.getElementById('modal-comentarios');
const btnDonarPaypal = document.getElementById('btn-donar-paypal');
const modalDonacion = document.getElementById('modal-donacion');
const iframeDonacion = document.getElementById('iframe-donacion');

// Lógica para abrir/cerrar modales
function abrirModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        // Resetear el modal de descarga al cerrarlo
        if (modal.id === 'modal-descarga') {
            modalStep1.style.display = 'block';
            modalStep2.style.display = 'none';
        }
        // Limpiar el iframe al cerrar el modal de donación
        if (modal.id === 'modal-donacion') {
            iframeDonacion.src = "";
        }
    }
}

btnObtenerKit?.addEventListener('click', () => abrirModal(modalDescarga));
btnComentariosModal?.addEventListener('click', () => abrirModal(modalComentarios));
btnDonarPaypal?.addEventListener('click', () => {
    iframeDonacion.src = "https://www.paypal.com/donate/?hosted_button_id=V99AFJPD3Z5LQ";
    abrirModal(modalDonacion);
});

document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        cerrarModal(modal);
    });
});

window.addEventListener('click', (event) => {
    if (event.target === modalDescarga) {
        cerrarModal(modalDescarga);
    }
    if (event.target === modalComentarios) {
        cerrarModal(modalComentarios);
    }
    if (event.target === modalDonacion) {
        cerrarModal(modalDonacion);
    }
});


// ======== MANEJO DEL FORMULARIO Y DESCARGAS ========
const formKit = document.getElementById("form-kit");
const descargarPdfBtn = document.getElementById('descargar-pdf');
const descargarEbookBtn = document.getElementById('descargar-ebook');

// Paso 1: Obtener el nombre y mostrar los botones de formato
formKit?.addEventListener("submit", (e) => {
    e.preventDefault();
    nombreUsuario = document.getElementById("nombre-usuario").value;
    modalStep1.style.display = 'none';
    modalStep2.style.display = 'block';
});

// Paso 2: Descarga del PDF con el nombre personalizado y la nueva fuente
descargarPdfBtn?.addEventListener('click', async () => {
    const { PDFDocument, rgb } = PDFLib;
    try {
        const existingPdfBytes = await fetch("https://tu-dominio.com/assets/kit_base.pdf").then(res => res.arrayBuffer());
        const fontUrl = "https://github.com/Notilogica/EnCorto-News/raw/refs/heads/main/Allura-Regular.ttf";
        const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
        
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const customFont = await pdfDoc.embedFont(fontBytes);
        
        const pages = pdfDoc.getPages();
        const portada = pages[0];

        const { width, height } = portada.getSize();
        const mensajePersonalizado = `No estás solo, recuérdalo ${nombreUsuario}`;
        const fontSize = 48;
        const textWidth = customFont.widthOfTextAtSize(mensajePersonalizado, fontSize);
        const margin = 50;
        const xPos = width - textWidth - margin;
        const yPos = margin;

        portada.drawText(mensajePersonalizado, {
            x: xPos,
            y: yPos,
            size: fontSize,
            font: customFont,
            color: rgb(1, 1, 1),
            borderColor: rgb(0, 0, 0),
            borderWidth: 2,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Kit_Emocional_${nombreUsuario.replace(/ /g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        cerrarModal(modalDescarga);
        mostrarPopalertInstrucciones('pdf', nombreUsuario);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Ocurrió un error al descargar el kit. Por favor, inténtalo de nuevo más tarde.");
    }
});

// Paso 2: Descarga del Ebook (sin personalización)
descargarEbookBtn?.addEventListener('click', () => {
    descargarArchivo('/assets/kit.epub', 'Kit_Emocional.epub');
    kitDescargado = true;
    cerrarModal(modalDescarga);
    mostrarPopalertInstrucciones('ebook', nombreUsuario);
});


function descargarArchivo(url, nombreArchivo) {
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ======== POPALERT INSTRUCCIONES MEJORADO ========
function mostrarPopalertInstrucciones(tipo, nombre) {
    const popalert = document.createElement('div');
    popalert.classList.add('popalert');
    let mensajeInstrucciones = '';
    let mensajeEmocional = `Ya diste el primer paso, tu proceso importa 💕`;
    if (nombre) {
        mensajeEmocional = `Ya diste el primer paso, tu proceso importa ${nombre} 💕`;
    }

    if (tipo === 'pdf') {
        mensajeInstrucciones = `Usa una app que te permita editar PDFs y guardar tu progreso. Te recomendamos <a href="https://www.onlyoffice.com/?via=angel" target="_blank" style="color: var(--accent-color); text-decoration: underline;">OnlyOffice</a>.`;
    } else {
        mensajeInstrucciones = 'Recomendamos usar Pages (iOS) o Kindle (Android) para visualizar correctamente tu eBook.';
    }

    popalert.innerHTML = `
        <div class="popalert-content">
            <span class="close-popalert">×</span>
            <h3>✅ Instrucciones</h3>
            <p>${mensajeInstrucciones}</p>
            <p>${mensajeEmocional}</p>
        </div>
    `;
    document.body.appendChild(popalert);

    popalert.querySelector('.close-popalert').addEventListener('click', () => {
        popalert.remove();
    });
}


// ======== POPALERT EXTRA EMOCIONAL AL CERRAR PESTAÑA ========
window.addEventListener('beforeunload', function (e) {
    const mensaje = kitDescargado
        ? 'Recuerda, no estás roto, estás en construcción.'
        : 'Recuerda que tu Kit te estará esperando. Avanza a tu ritmo. No estás roto, estás en construcción.';
    (e || window.event).returnValue = mensaje;
    return mensaje;
});

// ======== POPALERT DE ANUNCIO AL FOOTER ========
const footer = document.querySelector('footer');
let footerAlertMostrado = false;

function mostrarPopalertBanner() {
    if (footerAlertMostrado) return;
    footerAlertMostrado = true;

    const popalert = document.createElement('div');
    popalert.classList.add('popalert');
    popalert.innerHTML = `
        <div class="popalert-content">
            <span class="close-popalert">×</span>
            <h3>💡 Descubre más recursos</h3>
            <div class="banner-ad">
                <a href="https://smartlink.example.com" target="_blank">
                    <img src="/assets/banner-ad.jpg" alt="Banner Ad" />
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(popalert);

    popalert.querySelector('.close-popalert').addEventListener('click', () => {
        popalert.remove();
        // Intentar abrir nuevo Smartlink en ventana aparte
        window.open('https://smartlink.example.com', '_blank');
    });
}

window.addEventListener('scroll', () => {
    if (footer && !footerAlertMostrado) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (footerTop < windowHeight) {
            mostrarPopalertBanner();
        }
    }
});

// ======== GSAP / LENIS ANIMACIONES ========
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => t,
    smooth: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Animaciones de entrada de secciones
gsap.utils.toArray('.content, #unirse, #comentarios').forEach((el) => {
    gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
});

// ======== MODO CLARO/OSCURO ========
const themeToggle = document.getElementById('theme-toggle');

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    let theme = 'dark';
    if (document.body.classList.contains('light-mode')) {
        theme = 'light';
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }
    localStorage.setItem('theme', theme);
});
