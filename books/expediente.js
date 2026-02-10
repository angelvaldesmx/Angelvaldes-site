document.addEventListener("DOMContentLoaded", () => {
    
    // --- CONFIGURACIÓN ---
    const releaseDate = new Date("2026-03-18T00:00:00").getTime(); 
    // ENLACE API RESTAURADO
    const API_URL = "https://black-fire-dc65.angelmills982.workers.dev";
    
    // Inicialización de componentes
    const galleryManager = init3DGallery(); 
    setupSubscriptionForm(); // <-- Lógica del formulario activada

    // --- SECUENCIA DE ANIMACIÓN (GSAP) ---
    const tl = gsap.timeline();

    // 1. Fase Ingenua
    tl.to(".old-cover", { rotation: 3, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", delay: 1 })
      .to("#phase-old", { filter: "invert(100%) hue-rotate(90deg)", duration: 0.1, yoyo: true, repeat: 3 })
      
    // 2. Transición Glitch
      .to("#phase-old", { autoAlpha: 0, duration: 0.1 }) 
      .to("#glitch-overlay", { autoAlpha: 1, duration: 0.1 }, "<")
      
      .fromTo(".glitch-message", 
          { scale: 3, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }
      )
      .to(".glitch-message", { x: 5, yoyo: true, repeat: 10, duration: 0.05 })
      .to({}, { duration: 2.5 }) // Espera de lectura

    // 3. Reloj
      .to("#glitch-overlay", { autoAlpha: 0, duration: 0.5 })
      .to("#countdown-layer", { 
          autoAlpha: 1, 
          duration: 0.5, 
          onStart: () => startCountdown()
      }, "-=0.2");

    // --- LÓGICA DEL RELOJ ---
    function startCountdown() {
        const timeEl = document.querySelector('.time');
        const btn = document.getElementById('enter-gallery-btn');
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                timeEl.innerHTML = "YA DISPONIBLE";
                clearInterval(timer);
            } else {
                const d = Math.floor(distance / (1000 * 60 * 60 * 24));
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                timeEl.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            }
        }, 1000);

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
                autoAlpha: 1, 
                duration: 1,
                onComplete: () => galleryManager.startAnimation()
            });
        });
    }

    // --- LÓGICA DEL FORMULARIO (RESTAURADA) ---
    function setupSubscriptionForm() {
        const form = document.getElementById('gallery-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const input = document.getElementById('email-input');
            const originalText = btn.innerText;

            // UI de carga
            btn.innerText = "ENCRIPTANDO...";
            btn.disabled = true;
            btn.style.backgroundColor = "#555";

            try {
                // Fetch al Worker de Cloudflare
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        email: input.value, 
                        name: "Agente Antihéroe",
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    // Éxito
                    btn.innerText = "ACCESO CONCEDIDO";
                    btn.style.backgroundColor = "#00ff41"; 
                    btn.style.color = "black";
                    btn.style.borderColor = "#00ff41";
                    btn.style.boxShadow = "0 0 15px #00ff41";
                    
                    input.value = "";
                    input.placeholder = "REGISTRO COMPLETADO";
                    input.disabled = true;

                    // Mensaje extra en la descripción
                    const desc = form.closest('.slide-content').querySelector('.description');
                    if(desc) {
                        desc.insertAdjacentHTML('beforeend', 
                            `<br><br><span style="color:#00ff41; font-weight:800; font-family:'Courier Prime'">>> DATOS ENVIADOS A LA RESISTENCIA.</span>`
                        );
                    }
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error(error);
                btn.innerText = "ERROR DE RED";
                btn.style.backgroundColor = "var(--hero-red)";
                
                // Resetear botón después de 3 segundos
                setTimeout(() => { 
                    btn.innerText = originalText; 
                    btn.disabled = false; 
                    btn.style.backgroundColor = "";
                    btn.style.color = "white";
                    btn.style.boxShadow = "5px 5px 0 white";
                }, 3000);
            }
        });
    }

    // --- MOTOR 3D (THREE.JS) ---
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
        const particlesCount = 800;
        const particlesGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(particlesCount * 3);
        for(let i=0; i<particlesCount*3; i++) posArray[i] = (Math.random() - 0.5) * 60;
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.15, color: 0xFF4500, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });
        scene.add(new THREE.Points(particlesGeo, particlesMat));

        // Imágenes
        const textureLoader = new THREE.TextureLoader();
        const imageUrls = ['/images/antiheroe-cover.jpg', '/images/old-cover.jpg'];
        
        imageUrls.forEach((url, i) => {
            const group = new THREE.Group();
            group.position.x = i * 40; 
            textureLoader.load(url, (texture) => {
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 18), new THREE.MeshBasicMaterial({ map: texture }));
                const border = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 18.5), new THREE.MeshBasicMaterial({ color: 0x000000 }));
                border.position.z = -0.1;
                group.add(border); group.add(mesh);
            }, undefined, () => {
                // Fallback si falla imagen
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 18), new THREE.MeshBasicMaterial({ color: 0x222 }));
                group.add(mesh);
            });
            scene.add(group);
        });

        // Scroll
        let scrollTarget = 0, scrollCurrent = 0;
        window.addEventListener('wheel', (e) => {
            scrollTarget += e.deltaY * 0.05;
            scrollTarget = Math.max(0, Math.min(scrollTarget, (imageUrls.length - 1) * 40));
        });
        
        // Touch
        let touchStart = 0;
        window.addEventListener('touchstart', (e) => touchStart = e.touches[0].clientX);
        window.addEventListener('touchmove', (e) => {
            const diff = touchStart - e.touches[0].clientX;
            scrollTarget += diff * 0.1;
            scrollTarget = Math.max(0, Math.min(scrollTarget, (imageUrls.length - 1) * 40));
            touchStart = e.touches[0].clientX;
        });

        let isAnimating = false;
        function animate() {
            if(!isAnimating) return;
            requestAnimationFrame(animate);
            
            // Animación Partículas
            const positions = particlesGeo.attributes.position.array;
            for(let i=1; i < particlesCount*3; i+=3) {
                positions[i] += 0.03; 
                if(positions[i] > 20) positions[i] = -20; 
            }
            particlesGeo.attributes.position.needsUpdate = true;

            scrollCurrent += (scrollTarget - scrollCurrent) * 0.1;
            camera.position.x = scrollCurrent;

            // Update UI activa
            const idx = Math.round(scrollCurrent / 40);
            document.querySelectorAll('.slide-content').forEach((el, i) => {
                if(i === idx) el.classList.add('active');
                else el.classList.remove('active');
            });

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
                                     
