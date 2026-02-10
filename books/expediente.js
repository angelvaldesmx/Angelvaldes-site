document.addEventListener("DOMContentLoaded", () => {
    
    // --- CONFIGURACIÓN MAESTRA ---
    const releaseDate = new Date("2026-03-18T00:00:00").getTime(); 
    // Asegúrate de que esta URL sea la correcta de tu Worker de Cloudflare
    const API_URL = "https://black-fire-dc65.angelmills982.workers.dev"; 

    // --- DETECCIÓN DE MODO (PÚBLICO vs VIP) ---
    // Buscamos si hay un token en la URL (ej: misitio.com?agent_token=ABC1234)
    const urlParams = new URLSearchParams(window.location.search);
    const agentToken = urlParams.get('agent_token');

    if (agentToken) {
        // [MODO VIP] Iniciar Protocolo de Seguridad
        initSecureMode(agentToken);
    } else {
        // [MODO PÚBLICO] Iniciar Landing Page Normal
        initPublicMode();
    }

    // =========================================================
    // LÓGICA MODO VIP (ZONA SEGURA)
    // =========================================================
    async function initSecureMode(token) {
        // 1. Ocultar interfaz pública inmediatamente
        const publicInterface = document.getElementById('public-interface');
        if (publicInterface) publicInterface.style.display = 'none';
        
        // 2. Mostrar Loader
        const loader = document.getElementById('security-check');
        loader.classList.remove('hidden-start');
        loader.style.visibility = 'visible';
        loader.style.opacity = '1';

        try {
            // 3. Validar token con el Backend (Cloudflare Worker)
            const response = await fetch(`${API_URL}?verify=${token}`);
            const data = await response.json();

            if (response.ok && data.access === 'granted') {
                // ACCESO CONCEDIDO
                loader.style.display = 'none';
                
                const secureZone = document.getElementById('secure-zone');
                secureZone.classList.remove('hidden-start');
                secureZone.style.visibility = 'visible';
                secureZone.style.opacity = '1';
                
                // Personalizar saludo
                const agentName = data.agentName || "AGENTE";
                document.getElementById('agent-welcome').innerText = `HOLA, ${agentName.toUpperCase()}`;
                
                // Crear botón de descarga dinámicamente
                const container = document.getElementById('download-container');
                container.innerHTML = ''; // Limpiar
                
                const downloadBtn = document.createElement('a');
                downloadBtn.href = data.downloadUrl; 
                downloadBtn.setAttribute('download', '');
                downloadBtn.innerHTML = "⬇ DESCARGAR EXPEDIENTE COMPLETO";
                downloadBtn.className = "secure-download-btn";
                // Estilos inline para asegurar impacto visual
                downloadBtn.style.cssText = "display:inline-block; background:#00ff41; color:black; padding:20px 40px; font-family:'Bangers'; font-size:1.5rem; text-decoration:none; border:3px solid black; box-shadow:0 0 30px rgba(0,255,65,0.5); transform:rotate(-2deg); transition:0.2s;";
                
                downloadBtn.onmouseover = () => downloadBtn.style.transform = "rotate(0deg) scale(1.05)";
                downloadBtn.onmouseout = () => downloadBtn.style.transform = "rotate(-2deg) scale(1)";
                
                container.appendChild(downloadBtn);

            } else {
                throw new Error("Token inválido");
            }
        } catch (error) {
            console.error(error);
            loader.innerHTML = `<h2 style="color:red; font-family:'Courier Prime'">ACCESO DENEGADO</h2><p style="color:white">Token expirado o inexistente.</p><br><a href="/" style="color:white; text-decoration:underline;">Volver al inicio</a>`;
        }
    }

    // =========================================================
    // LÓGICA MODO PÚBLICO (ANIMACIÓN & CAPTACIÓN)
    // =========================================================
    function initPublicMode() {
        // Inicializar componentes (pero pausar 3D hasta que sea necesario)
        const galleryManager = init3DGallery(); 
        setupSubscriptionForm();

        // --- SECUENCIA GSAP MAESTRA ---
        const tl = gsap.timeline();

        // 1. Fase Ingenua (Old Cover)
        tl.to(".old-cover", { rotation: 3, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", delay: 1 })
          .to("#phase-old", { filter: "invert(100%) hue-rotate(90deg)", duration: 0.1, yoyo: true, repeat: 3 })
          
        // 2. Transición Glitch (Sin pantallazos negros)
          .to("#phase-old", { autoAlpha: 0, duration: 0.1 }) 
          .to("#glitch-overlay", { autoAlpha: 1, duration: 0.1 }, "<")
          
          .fromTo(".glitch-message", 
             { scale: 3, opacity: 0 }, 
             { scale: 1, opacity: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }
          )
          .to(".glitch-message", { x: 5, yoyo: true, repeat: 10, duration: 0.05 })
          .to({}, { duration: 2.0 }) // Tiempo de lectura
          
        // 3. Reloj (Countdown)
          .to("#glitch-overlay", { autoAlpha: 0, duration: 0.5 })
          .to("#countdown-layer", { 
             autoAlpha: 1, 
             duration: 0.5, 
             onStart: startCountdown 
          }, "-=0.2");

        // Lógica del Reloj
        function startCountdown() {
            const timeEl = document.querySelector('.time');
            const btn = document.getElementById('enter-gallery-btn');
            
            const updateClock = () => {
                const now = new Date().getTime();
                const dist = releaseDate - now;
                if (dist < 0) { 
                    timeEl.innerHTML = "YA DISPONIBLE"; 
                    return; 
                }
                const d = Math.floor(dist / (1000 * 60 * 60 * 24));
                const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                timeEl.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}`;
            };
            
            const timer = setInterval(updateClock, 1000); 
            updateClock(); // Ejecutar inmediatamente

            // Revelar botón
            setTimeout(() => {
                btn.classList.remove('hidden-start');
                gsap.fromTo(btn, 
                    { autoAlpha: 0, scale: 0, rotation: -10 }, 
                    { autoAlpha: 1, scale: 1, rotation: -2, duration: 0.5, ease: "back.out(1.7)" }
                );
            }, 1500);

            btn.addEventListener('click', () => {
                // Transición Final: Reloj -> Galería
                gsap.to("#countdown-layer", { autoAlpha: 0, duration: 1 });
                gsap.to("#gallery-layer", { 
                    autoAlpha: 1, 
                    duration: 1, 
                    onComplete: () => galleryManager.startAnimation() // Iniciar loop 3D aquí para ahorrar batería
                });
            });
        }
    }

    // --- FORMULARIO PÚBLICO (Cloudflare Worker) ---
    function setupSubscriptionForm() {
        const form = document.getElementById('gallery-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const emailIn = document.getElementById('email-input');
            const nameIn = document.getElementById('name-input');
            const originalText = btn.innerText;

            btn.innerText = "ENCRIPTANDO..."; 
            btn.disabled = true;

            try {
                const response = await fetch(API_URL, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        email: emailIn.value, 
                        name: nameIn.value,
                        source: 'landing_page'
                    })
                });

                if (response.ok) {
                    btn.innerText = "ACCESO CONCEDIDO"; 
                    btn.style.background = "#00ff41"; 
                    btn.style.color = "black";
                    emailIn.value = ""; 
                    nameIn.value = "";
                    
                    const desc = form.closest('.slide-content').querySelector('.description');
                    if(desc) desc.insertAdjacentHTML('beforeend', '<br><br><span style="color:#00ff41; font-weight:bold;">>> DATOS ENVIADOS A LA RESISTENCIA. REVISA TU SPAM.</span>');
                } else {
                    throw new Error("Server Error");
                }
            } catch (err) {
                console.error(err);
                btn.innerText = "ERROR DE RED"; 
                btn.style.background = "var(--hero-red)";
                setTimeout(() => { 
                    btn.innerText = originalText; 
                    btn.disabled = false; 
                    btn.style.background = "";
                }, 3000);
            }
        });
    }

    // --- MOTOR 3D (THREE.JS) ---
    function init3DGallery() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        
        // Escena y Cámara
        const scene = new THREE.Scene(); 
        scene.fog = new THREE.FogExp2(0x050505, 0.035);
        
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000); 
        camera.position.set(0,0,25);
        
        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true}); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        
        // Partículas (Ambiente)
        const particlesGeo = new THREE.BufferGeometry(); 
        const pos = new Float32Array(1600 * 3);
        for(let i=0; i<1600*3; i++) pos[i] = (Math.random()-0.5)*60;
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        
        const particlesMat = new THREE.PointsMaterial({
            size: 0.15, color: 0xFF4500, transparent:true, opacity:0.8, blending: THREE.AdditiveBlending
        });
        scene.add(new THREE.Points(particlesGeo, particlesMat));

        // Carga de Portadas
        const loader = new THREE.TextureLoader();
        const covers = ['/images/antiheroe-cover.jpg', '/images/old-cover.jpg'];
        
        covers.forEach((url, i) => {
            const group = new THREE.Group(); 
            group.position.x = i*40;
            
            loader.load(url, (texture) => {
                // Imagen Principal
                const geo = new THREE.PlaneGeometry(12, 18);
                const mat = new THREE.MeshBasicMaterial({map: texture});
                group.add(new THREE.Mesh(geo, mat));
                
                // Borde Negro (Efecto Cómic)
                const borderGeo = new THREE.PlaneGeometry(12.5, 18.5);
                const borderMat = new THREE.MeshBasicMaterial({color: 0x000000});
                const border = new THREE.Mesh(borderGeo, borderMat);
                border.position.z = -0.1;
                group.add(border);
                
            }, undefined, (err) => {
                // Fallback si no carga imagen
                console.warn("Imagen no encontrada:", url);
                const geo = new THREE.PlaneGeometry(12, 18);
                const mat = new THREE.MeshBasicMaterial({color: i===0 ? 0xFFD700 : 0x555555});
                group.add(new THREE.Mesh(geo, mat));
            });
            
            scene.add(group);
        });

        // Control de Scroll
        let targetX = 0, currentX = 0;
        
        // Mouse Wheel
        window.addEventListener('wheel', e => {
            targetX += e.deltaY * 0.05;
            targetX = Math.max(0, Math.min(targetX, (covers.length - 1) * 40));
        });
        
        // Touch (Móvil)
        let touchStart = 0;
        window.addEventListener('touchstart', e => touchStart = e.touches[0].clientX);
        window.addEventListener('touchmove', e => {
            const diff = touchStart - e.touches[0].clientX;
            targetX += diff * 0.1;
            targetX = Math.max(0, Math.min(targetX, (covers.length - 1) * 40));
            touchStart = e.touches[0].clientX;
        });

        // Loop de Animación
        let isAnimating = false;
        function animate() {
            if (!isAnimating) return;
            requestAnimationFrame(animate);
            
            // Suavizado de Cámara
            currentX += (targetX - currentX) * 0.1;
            camera.position.x = currentX;
            
            // Sincronización con UI HTML
            const slideIndex = Math.round(currentX / 40);
            document.querySelectorAll('.slide-content').forEach((el, i) => {
                if(i === slideIndex) el.classList.add('active'); 
                else el.classList.remove('active');
            });
            
            // Movimiento sutil de partículas
            const positions = particlesGeo.attributes.position.array;
            for(let i=1; i < 1600*3; i+=3) {
                positions[i] += 0.03; 
                if(positions[i] > 30) positions[i] = -30; 
            }
            particlesGeo.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { startAnimation: () => { isAnimating = true; animate(); } };
    }
});
            
