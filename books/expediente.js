/**
 * ANTIHEROE: MANUAL DE RESISTENCIA - SISTEMA OPERATIVO v6.0 (DIGITAL DESCLASSIFICATION)
 * Desarrollado por: Angel Valdes & The Syndicate
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 1. CONFIGURACIÓN MAESTRA
    // =========================================================
    const CONFIG = {
        releaseDate: new Date("2026-04-23T00:00:00").getTime(), // Fecha de Desclasificación
        apiUrl: "https://black-fire-dc65.angelmills982.workers.dev", // Enlace oficial a tu Worker
        pdfUrl: "/assets/files/evidence_x99_secure_v2.pdf"
    };

    const state = {
        agentToken: new URLSearchParams(window.location.search).get('agent_token')
    };

    // --- INICIO DE PROTOCOLO ---
    if (state.agentToken) {
        initSecureMode(state.agentToken);
    } else {
        initPublicMode();
    }

    // =========================================================
    // 2. MODO VIP (ZONA SEGURA DIGITAL)
    // =========================================================
    async function initSecureMode(token) {
        const pubInterface = document.getElementById('public-interface');
        const stickyCta = document.getElementById('sticky-cta');
        
        if(pubInterface) pubInterface.style.display = 'none';
        if(stickyCta) stickyCta.style.display = 'none'; 
        
        const loader = document.getElementById('security-check');
        loader.classList.remove('hidden-start');

        try {
            const response = await fetch(`${CONFIG.apiUrl}?verify=${token}`);
            const data = await response.json();

            if (response.ok && data.access === 'granted') {
                loader.style.display = 'none';
                const secureZone = document.getElementById('secure-zone');
                secureZone.classList.remove('hidden-start');
                
                document.getElementById('agent-welcome').innerText = `HOLA, ${data.agentName.toUpperCase()}`;
                const agentNameEl = document.getElementById('agent-welcome-name');
                if (agentNameEl) {
                    agentNameEl.innerText = data.agentName.toUpperCase();
                }
                
                setupDownloadLogic(); 
                console.log(">> Acceso Nivel Agente Concedido. Modalidad Digital.");
            } else {
                throw new Error("Token Corrupto");
            }
        } catch (error) {
            console.error("Security Error:", error);
            loader.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h2 style="color:var(--hero-red); font-family:'Bangers'; font-size:3rem;">ACCESO DENEGADO</h2>
                    <p style="color:white; font-family:'Courier Prime';">Credenciales expiradas o inexistentes.</p>
                    <a href="/" style="color:var(--hero-yellow); margin-top:20px; display:block; text-decoration:underline; font-family:'Courier Prime';">REINTENTAR ACCESO</a>
                </div>
            `;
        }
    }

    function setupDownloadLogic() {
        const manualLink = document.getElementById('manual-link');
        if (manualLink) {
            manualLink.addEventListener('click', () => {
                Swal.fire({
                    title: 'INICIANDO DESCARGA...',
                    text: 'Recuerda que el archivo requiere tu Llave de Agente para abrirse. Revisa tu correo o la credencial en esta pantalla.',
                    icon: 'info',
                    background: '#050505',
                    color: '#fff',
                    confirmButtonText: 'ENTENDIDO',
                    confirmButtonColor: '#FF0050',
                    backdrop: `rgba(255, 0, 80, 0.2)`
                });
            });
        }
    }

    // =========================================================
    // 3. MODO PÚBLICO (SCROLL BRUTALISTA)
    // =========================================================
    function initPublicMode() {
        setupSubscriptionForm();
        startCountdown();
        setupScrollAnimations();
        setupExitIntent(); 
        
        gsap.to("#public-interface", { autoAlpha: 1, duration: 0.5, display: 'block' });
    }

    function startCountdown() {
        const timeEls = document.querySelectorAll('.time');
        
        const updateClock = () => {
            const now = new Date().getTime();
            const dist = CONFIG.releaseDate - now;

            if (dist < 0) {
                timeEls.forEach(el => el.innerHTML = "DESCLASIFICADO");
                return;
            }
            const d = Math.floor(dist / (1000 * 60 * 60 * 24));
            const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((dist % (1000 * 60)) / 1000); 
            
            timeEls.forEach(el => {
                el.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            });
        };
        
        setInterval(updateClock, 1000);
        updateClock();
    }

    // =========================================================
    // 4. FORMULARIO DE CAPTACIÓN
    // =========================================================
    function setupSubscriptionForm() {
        const form = document.getElementById('gallery-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const emailIn = document.getElementById('email-input');
            const nameIn = document.getElementById('name-input');
            const originalText = btn.innerText;

            btn.innerText = "CONTACTANDO AL SINDICATO...";
            btn.disabled = true;

            try {
                const response = await fetch(CONFIG.apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        email: emailIn.value, 
                        name: nameIn.value
                    })
                });

                if (response.ok) {
                    btn.innerText = "ACCESO CONCEDIDO";
                    btn.style.background = "#00ff41";
                    btn.style.color = "black";
                    
                    if(!document.getElementById('success-msg')) {
                        form.insertAdjacentHTML('beforeend', 
                            `<div id="success-msg" style="color:#00ff41; font-family:'Courier Prime'; font-weight:bold; margin-top: 15px; text-align: center;">>> ENLACE ENVIADO A TU CORREO. REVISA SPAM.</div>`
                        );
                    }
                    
                    emailIn.value = ""; nameIn.value = "";
                } else { throw new Error(); }
            } catch (err) {
                btn.innerText = "ERROR DE SISTEMA";
                btn.style.background = "var(--hero-red)";
                setTimeout(() => { 
                    btn.innerText = originalText; 
                    btn.disabled = false; 
                    btn.style.background = "";
                }, 3000);
            }
        });
    }

    // =========================================================
    // 5. ANIMACIONES Y RETENCIÓN
    // =========================================================
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        setTimeout(() => {
            document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
        }, 800);
    }

    function setupExitIntent() {
        let exitIntentFired = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0 && !exitIntentFired) {
                exitIntentFired = true;
                
                Swal.fire({
                    title: '¿ABANDONAS LA MISIÓN?',
                    text: 'El sistema borrará tu rastro en 30 segundos. Llévate el Prólogo Gratuito antes de desaparecer.',
                    icon: 'warning',
                    background: '#050505',
                    color: '#fff',
                    confirmButtonText: 'DESCARGAR PRÓLOGO',
                    confirmButtonColor: '#FF0050',
                    showCancelButton: true,
                    cancelButtonText: 'Huir a la Matrix',
                    cancelButtonColor: '#333'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const targetForm = document.getElementById('scan-module') || document.getElementById('gallery-form');
                        if (targetForm) {
                            targetForm.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                    }
                });
            }
        });
    }
});

// =========================================================
// 6. FUNCIONES GLOBALES DE PAGO (PAYPAL)
// =========================================================
window.openPaymentModal = function() {
    const modal = document.getElementById('payment-modal');
    if(modal) modal.style.display = 'flex';
    
    const container = document.getElementById('paypal-button-container');
    
    // Validar si el SDK de PayPal cargó y si el contenedor está vacío
    if (window.paypal && container && container.innerHTML === '') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({ 
                    purchase_units: [{ 
                        amount: { value: '449.00' }, // PRECIO EXACTO
                        description: 'Antiheroe: Manual de Resistencia (Edición Fundador)'
                    }] 
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    
                    document.getElementById('payment-modal').style.display = 'none';
                    
                    Swal.fire({
                        title: '¡PAGO INTERCEPTADO!', 
                        text: 'Bienvenido a The Syndicate, ' + details.payer.name.given_name + '. Tu lugar está asegurado.', 
                        icon: 'success', 
                        background: '#050505', 
                        color: '#00ff41',
                        confirmButtonColor: '#FF0050'
                    });
                });
            }
        }).render('#paypal-button-container');
    } else if (!window.paypal) {
        console.error("El SDK de PayPal no ha cargado correctamente.");
    }
};

window.closePaymentModal = function() {
    const modal = document.getElementById('payment-modal');
    if(modal) modal.style.display = 'none';
};
                    
