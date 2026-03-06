/**
 * ANTIHEROE: MANUAL DE RESISTENCIA - SISTEMA OPERATIVO v5.0 (DIGITAL DESCLASSIFICATION)
 * Desarrollado por: Angel Valdes & The Syndicate
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 1. CONFIGURACIÓN MAESTRA
    // =========================================================
    const CONFIG = {
        releaseDate: new Date("2026-04-23T00:00:00").getTime(), // Nueva fecha
        apiUrl: "https://black-fire-dc65.angelmills982.workers.dev", // Tu Worker
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
        // Limpieza de interfaz pública
        const pubInterface = document.getElementById('public-interface');
        if(pubInterface) pubInterface.style.display = 'none';
        
        const loader = document.getElementById('security-check');
        loader.classList.remove('hidden-start');

        try {
            // Validación con Worker de Cloudflare
            const response = await fetch(`${CONFIG.apiUrl}?verify=${token}`);
            const data = await response.json();

            if (response.ok && data.access === 'granted') {
                loader.style.display = 'none';
                const secureZone = document.getElementById('secure-zone');
                secureZone.classList.remove('hidden-start');
                
                // Personalización de la Credencial Digital
                document.getElementById('agent-welcome').innerText = `HOLA, ${data.agentName.toUpperCase()}`;
                const agentNameEl = document.getElementById('agent-welcome-name');
                if (agentNameEl) {
                    agentNameEl.innerText = data.agentName.toUpperCase();
                }
                
                // Configurar Descarga del Manual
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
                    <a href="/books/index.html" style="color:var(--hero-yellow); margin-top:20px; display:block; text-decoration:underline;">REINTENTAR ACCESO</a>
                </div>
            `;
        }
    }

    function setupDownloadLogic() {
        const manualLink = document.getElementById('manual-link');
        if (manualLink) {
            manualLink.addEventListener('click', (e) => {
                Swal.fire({
                    title: 'INICIANDO DESCARGA...',
                    text: 'Recuerda que el archivo requiere tu Llave de Agente para abrirse. Revisa tu correo o esta pantalla.',
                    icon: 'info',
                    background: '#000',
                    color: '#fff',
                    confirmButtonText: 'ENTENDIDO',
                    confirmButtonColor: '#FF4500',
                    backdrop: `rgba(255, 69, 0, 0.4)`
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
        
        // Muestra la nueva terminal brutalista inmediatamente
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
            const s = Math.floor((dist % (1000 * 60)) / 1000); // Segundos añadidos para dinamismo
            
            timeEls.forEach(el => {
                el.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            });
        };
        
        setInterval(updateClock, 1000);
        updateClock();
    }

    // =========================================================
    // 4. FORMULARIO DE CAPTACIÓN (CONECTADO AL WORKER)
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
                // Comunicación con tu Worker actual
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
                    
                    // Mensaje de éxito limpio
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
});
