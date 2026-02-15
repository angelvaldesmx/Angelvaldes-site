/**
 * ANTIHEROE: MANUAL DE RESISTENCIA - SISTEMA OPERATIVO v4.0 (FINAL)
 * Desarrollado por: Angel Valdes & The Syndicate
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 1. CONFIGURACIÓN MAESTRA
    // =========================================================
    const CONFIG = {
        releaseDate: new Date("2026-03-18T00:00:00").getTime(),
        apiUrl: "https://black-fire-dc65.angelmills982.workers.dev", // Tu Worker
        spacing3D: 40, 
        pdfUrl: "/assets/files/evidence_x99_secure_v2.pdf"
    };

    const state = {
        agentToken: new URLSearchParams(window.location.search).get('agent_token'),
        isDragging: false,
        scrollTarget: 0,
        scrollCurrent: 0
    };

    // --- INICIO DE PROTOCOLO ---
    if (state.agentToken) {
        initSecureMode(state.agentToken);
    } else {
        initPublicMode();
    }

    // =========================================================
    // 2. MODO VIP (ZONA SEGURA)
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
                
                // Personalización
                document.getElementById('agent-welcome').innerText = `HOLA, ${data.agentName.toUpperCase()}`;
                
                // 1. Configurar Descarga del Manual (Siempre disponible)
                setupDownloadLogic(); 

                // 2. Lógica del Evento Físico (Ticket vs Invitación)
                const ticketArea = document.getElementById('download-container');
                
                if (data.confirmado) {
                    // CASO A: YA CONFIRMÓ -> MOSTRAR TICKET QR
                    renderTicket(data.agentName, token);
                } else {
                    // CASO B: NO HA CONFIRMADO -> MOSTRAR INVITACIÓN ("Call to Action")
                    showEventInvitation(ticketArea);
                }

                console.log(">> Acceso Nivel Agente Concedido.");

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

    function showEventInvitation(container) {
        // Ocultamos el contenedor del ticket original
        const ticketWrapper = document.getElementById('ticket-scale-wrapper');
        if(ticketWrapper) ticketWrapper.style.display = 'none';
        
        const btnSave = document.getElementById('btn-download-ticket');
        if(btnSave) btnSave.style.display = 'none';

        // Inyectamos la Invitación
        const inviteHTML = `
            <div style="border: 2px solid var(--hero-yellow); padding: 25px; margin-bottom: 30px; background: rgba(255, 215, 0, 0.05); position: relative; overflow: hidden; text-align: left;">
                <div style="position: absolute; top:0; right:0; background:var(--hero-yellow); color:black; padding:5px 10px; font-family:'Bangers'; font-size:0.8rem;">
                    NUEVA MISIÓN
                </div>
                
                <h2 style="color:var(--hero-yellow); font-family:'Bangers'; font-size:2rem; margin-top:10px;">OPERACIÓN ARCOIRIS</h2>
                <p style="font-family:'Courier Prime'; color:#ccc; font-size:0.9rem; margin: 15px 0; line-height: 1.4;">
                    El <strong>18 de Marzo</strong> abriremos el búnker físico para la presentación del manifiesto.
                    <br><br>
                    No es una fiesta. Es un punto de extracción.
                </p>
                
                <div style="background: #111; padding: 15px; border-left: 3px solid var(--hero-red);">
                    <p style="color:white; font-family:'Courier Prime'; font-size:0.85rem; margin:0;">
                        <strong>⚠️ INSTRUCCIÓN DE ACCESO:</strong><br>
                        Para generar tu <strong>BOLETO QR</strong>, regresa a tu correo y responde a nuestro mensaje con la palabra:
                        <br><br>
                        <span style="font-size:1.5rem; color:var(--hero-red); font-weight:bold; letter-spacing:2px;">"PRESENTE"</span>
                    </p>
                </div>
                
                <p style="font-size:0.7rem; color:#666; margin-top:15px;">
                    Al hacerlo, el sistema desbloqueará tu QR en esta pantalla y recibirás las coordenadas exactas.
                </p>
            </div>
        `;
        
        // Insertamos ANTES del contenido existente
        container.insertAdjacentHTML('afterbegin', inviteHTML);
    }

    function renderTicket(name, token) {
        // Aseguramos que el ticket sea visible
        const ticketWrapper = document.getElementById('ticket-scale-wrapper');
        if(ticketWrapper) ticketWrapper.style.display = 'block';
        
        const btnSave = document.getElementById('btn-download-ticket');
        if(btnSave) btnSave.style.display = 'block';

        // Llenar datos
        const nameEl = document.getElementById('ticket-guest-name');
        if(nameEl) nameEl.innerText = name.toUpperCase();
        
        const idEl = document.getElementById('ticket-id');
        if(idEl) idEl.innerText = token;

        // Generar QR
        const qrBox = document.getElementById("ticket-qr");
        if(qrBox) {
            qrBox.innerHTML = '';
            new QRCode(qrBox, {
                text: `ANT-HERO|${token}`,
                width: 120, height: 120,
                colorDark: "#000000", colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        // Configurar botón de descarga
        setupTicketDownload(token);
    }

    function setupTicketDownload(token) {
         const btnSave = document.getElementById('btn-download-ticket');
         if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const node = document.getElementById('ticket-card');
                const originalText = btnSave.innerText;
                btnSave.innerText = "CAPTURANDO EVIDENCIA...";
                btnSave.disabled = true;

                try {
                    const dataUrl = await htmlToImage.toPng(node, { 
                        quality: 1, 
                        pixelRatio: 3, 
                        backgroundColor:'#000' 
                    });
                    const link = document.createElement('a');
                    link.download = `PASE_ANTIHEROE_${token}.png`;
                    link.href = dataUrl;
                    link.click();
                    
                    Swal.fire({
                        title: '¡GUARDADO!',
                        text: 'El pase está en tu galería. No lo pierdas.',
                        icon: 'success',
                        background: '#000', color: '#fff', confirmButtonColor: '#00ff41'
                    });
                } catch (err) {
                    console.error(err);
                    Swal.fire('ERROR', 'No se pudo generar la imagen. Toma un screenshot.', 'error');
                } finally {
                    btnSave.innerText = originalText;
                    btnSave.disabled = false;
                }
            });
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
    // 3. MODO PÚBLICO (LANDING & ANIMACIÓN)
    // =========================================================
    function initPublicMode() {
        const galleryManager = init3DGallery(); 
        setupSubscriptionForm();

        const tl = gsap.timeline();

        // Secuencia Intro
        tl.to(".old-cover", { rotation: 3, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", delay: 1 })
          .to("#phase-old", { filter: "invert(100%) hue-rotate(90deg)", duration: 0.1, yoyo: true, repeat: 3 })
          .to("#phase-old", { autoAlpha: 0, duration: 0.1 }) 
          .to("#glitch-overlay", { autoAlpha: 1, duration: 0.1 }, "<")
          .fromTo(".glitch-message", 
              { scale: 3, opacity: 0 }, 
              { scale: 1, opacity: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }
          )
          .to(".glitch-message", { x: 5, yoyo: true, repeat: 10, duration: 0.05 })
          .to({}, { duration: 2.0 })
          .to("#glitch-overlay", { autoAlpha: 0, duration: 0.5 })
          .to("#countdown-layer", { 
              autoAlpha: 1, 
              duration: 0.5, 
              onStart: () => startCountdown(galleryManager) 
          }, "-=0.2");
    }

    function startCountdown(galleryManager) {
        const timeEl = document.querySelector('.time');
        const btn = document.getElementById('enter-gallery-btn');
        
        const updateClock = () => {
            const now = new Date().getTime();
            const dist = CONFIG.releaseDate - now;

            if (dist < 0) {
                timeEl.innerHTML = "YA DISPONIBLE";
                return;
            }
            const d = Math.floor(dist / (1000 * 60 * 60 * 24));
            const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
            timeEl.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}`;
        };
        
        setInterval(updateClock, 1000);
        updateClock();

        setTimeout(() => {
            btn.classList.remove('hidden-start');
            gsap.fromTo(btn, 
                { autoAlpha: 0, scale: 0, rotation: -10 },
                { autoAlpha: 1, scale: 1, rotation: -2, duration: 0.5, ease: "back.out(1.7)" }
            );
        }, 1500);

        btn.addEventListener('click', () => {
            gsap.to("#countdown-layer", { autoAlpha: 0, duration: 1 });
            gsap.to("#gallery-layer", { 
                autoAlpha: 1, duration: 1,
                onComplete: () => galleryManager.startAnimation()
            });
        });
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
                    
                    const desc = form.closest('.slide-content').querySelector('.description');
                    desc.insertAdjacentHTML('beforeend', 
                        `<br><br><span style="color:#00ff41; font-family:'Courier Prime'; font-weight:bold;">>> ENLACE ENVIADO A TU CORREO. REVISA SPAM.</span>`
                    );
                    
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
    // 5. MOTOR 3D (THREE.JS) CON SNAPPING
    // =========================================================
    function init3DGallery() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.035);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 25);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Partículas
        const particlesGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(1800 * 3);
        for(let i=0; i<1800*3; i++) posArray[i] = (Math.random() - 0.5) * 60;
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMat = new THREE.PointsMaterial({
            size: 0.12, color: 0xFF4500, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        scene.add(new THREE.Points(particlesGeo, particlesMat));

        // Carga de Portadas
        const loader = new THREE.TextureLoader();
        const imageUrls = ['/images/antiheroe-cover.jpg', '/images/old-cover.jpg'];
        
        imageUrls.forEach((url, i) => {
            const group = new THREE.Group();
            group.position.x = i * CONFIG.spacing3D;
            
            loader.load(url, (texture) => {
                const mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(12, 18),
                    new THREE.MeshBasicMaterial({ map: texture })
                );
                const border = new THREE.Mesh(
                    new THREE.PlaneGeometry(12.6, 18.6),
                    new THREE.MeshBasicMaterial({ color: 0x000000 })
                );
                border.position.z = -0.1;
                group.add(border);
                group.add(mesh);
            });
            scene.add(group);
        });

        // Eventos Scroll/Touch
        window.addEventListener('wheel', (e) => {
            state.scrollTarget += e.deltaY * 0.04;
            state.scrollTarget = Math.max(0, Math.min(state.scrollTarget, (imageUrls.length - 1) * CONFIG.spacing3D));
        });

        window.addEventListener('touchstart', (e) => { 
            state.touchStart = e.touches[0].clientX; 
            state.isDragging = true;
        });
        
        window.addEventListener('touchmove', (e) => {
            const diff = state.touchStart - e.touches[0].clientX;
            state.scrollTarget += diff * 0.15;
            state.scrollTarget = Math.max(0, Math.min(state.scrollTarget, (imageUrls.length - 1) * CONFIG.spacing3D));
            state.touchStart = e.touches[0].clientX;
        });

        window.addEventListener('touchend', () => state.isDragging = false);

        let isAnimating = false;
        function animate() {
            if(!isAnimating) return;
            requestAnimationFrame(animate);

            // Snapping
            if (!state.isDragging) {
                const snapPoint = Math.round(state.scrollTarget / CONFIG.spacing3D) * CONFIG.spacing3D;
                state.scrollTarget += (snapPoint - state.scrollTarget) * 0.05;
            }

            // Lerp & Sync
            state.scrollCurrent += (state.scrollTarget - state.scrollCurrent) * 0.1;
            camera.position.x = state.scrollCurrent;

            const activeIdx = Math.round(state.scrollCurrent / CONFIG.spacing3D);
            document.querySelectorAll('.slide-content').forEach((el, i) => {
                el.classList.toggle('active', i === activeIdx);
            });

            // Particles Move
            const positions = particlesGeo.attributes.position.array;
            for(let i=1; i < 1800*3; i+=3) {
                positions[i] += 0.02;
                if(positions[i] > 30) positions[i] = -30;
            }
            particlesGeo.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { startAnimation: () => { isAnimating = true; animate(); } };
    }
});
                    
