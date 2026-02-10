document.addEventListener("DOMContentLoaded", () => {
    
    // --- CONFIGURACIÓN ---
    const releaseDate = new Date("2026-03-18T00:00:00").getTime(); 
    
    // Inicializamos ThreeJS oculto al principio para precargar
    const galleryManager = init3DGallery(); 

    // --- SECUENCIA MAESTRA ---
    const tl = gsap.timeline();

    // 1. FASE INGENUA (Visible por defecto)
    tl.to(".old-cover", { rotation: 3, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", delay: 1 })
      .to("#phase-old", { filter: "invert(100%) hue-rotate(90deg)", duration: 0.1, yoyo: true, repeat: 3 })
      
    // 2. EL GLITCH (Transición Crítica)
      .to("#phase-old", { autoAlpha: 0, duration: 0.1 }) // autoAlpha maneja opacity + visibility
      .to("#glitch-overlay", { autoAlpha: 1, duration: 0.1 }, "<") // "<" inicia al mismo tiempo que el anterior
      
      .fromTo(".glitch-message", 
          { scale: 3, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }
      )
      .to(".glitch-message", { x: 5, yoyo: true, repeat: 10, duration: 0.05 })
      .to({}, { duration: 2 }) // Pausa para leer

    // 3. EL RELOJ
      .to("#glitch-overlay", { autoAlpha: 0, duration: 0.5 })
      .to("#countdown-layer", { 
          autoAlpha: 1, 
          duration: 0.5, 
          onStart: () => {
              startCountdown(); // Inicia el contador visualmente
          }
      }, "-=0.2"); // Solapamiento ligero

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

        // Revelar botón de acceso
        setTimeout(() => {
            gsap.to(btn, { autoAlpha: 1, scale: 1, rotation: -2, duration: 0.5, ease: "back.out(1.7)" });
        }, 1500);

        btn.addEventListener('click', () => {
            // TRANSICIÓN FINAL: Reloj -> Galería
            gsap.to("#countdown-layer", { autoAlpha: 0, duration: 1 });
            gsap.to("#gallery-layer", { 
                autoAlpha: 1, 
                duration: 1,
                onComplete: () => {
                    galleryManager.startAnimation(); // Empezar loop de renderizado 3D aquí para ahorrar recursos antes
                }
            });
        });
    }

    // --- MOTOR 3D (THREE.JS) ---
    function init3DGallery() {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.035); 

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 25); 

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización móvil
        container.appendChild(renderer.domElement);

        // -- PARTÍCULAS --
        const particlesCount = 800;
        const particlesGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(particlesCount * 3);
        for(let i=0; i<particlesCount*3; i++) posArray[i] = (Math.random() - 0.5) * 60;
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.15, color: 0xFF4500, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });
        const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particlesMesh);

        // -- CARGA DE TEXTURAS (CON FALLBACK) --
        const textureLoader = new THREE.TextureLoader();
        
        // Define tus imágenes aquí
        const imageUrls = [
            '/images/antiheroe-cover.jpg', // Asegúrate que esta ruta exista
            '/images/old-cover.jpg'
        ];
        
        // Grupo para scroll
        const galleryGroup = new THREE.Group();
        scene.add(galleryGroup);

        imageUrls.forEach((url, i) => {
            const group = new THREE.Group();
            group.position.x = i * 40; // Distancia entre slides

            // Cargador con manejo de error
            textureLoader.load(
                url, 
                (texture) => {
                    const geo = new THREE.PlaneGeometry(12, 18);
                    const mat = new THREE.MeshBasicMaterial({ map: texture });
                    const mesh = new THREE.Mesh(geo, mat);
                    
                    const border = new THREE.Mesh(
                        new THREE.PlaneGeometry(12.5, 18.5), 
                        new THREE.MeshBasicMaterial({ color: 0x000000 })
                    );
                    border.position.z = -0.1;
                    group.add(border);
                    group.add(mesh);
                },
                undefined,
                (err) => {
                    console.warn(`Error cargando ${url}. Usando placeholder.`);
                    // Fallback visual si falla la imagen
                    const geo = new THREE.PlaneGeometry(12, 18);
                    const mat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xFFD700 : 0xFF4500 }); // Amarillo o Rojo
                    const mesh = new THREE.Mesh(geo, mat);
                    group.add(mesh);
                }
            );
            galleryGroup.add(group);
        });

        // -- SCROLL LOGIC --
        let scrollTarget = 0, scrollCurrent = 0;
        
        // Soporte Wheel y Touch
        window.addEventListener('wheel', (e) => {
            scrollTarget += e.deltaY * 0.05;
            scrollTarget = Math.max(0, Math.min(scrollTarget, (imageUrls.length - 1) * 40));
        });
        
        // Touch básico para móvil
        let touchStart = 0;
        window.addEventListener('touchstart', (e) => touchStart = e.touches[0].clientX);
        window.addEventListener('touchmove', (e) => {
            const touchEnd = e.touches[0].clientX;
            const diff = touchStart - touchEnd;
            scrollTarget += diff * 0.1;
            scrollTarget = Math.max(0, Math.min(scrollTarget, (imageUrls.length - 1) * 40));
            touchStart = touchEnd;
        });

        // -- RENDER LOOP --
        let isAnimating = false;
        
        function animate() {
            if(!isAnimating) return;
            requestAnimationFrame(animate);

            // Partículas movimiento
            const positions = particlesGeo.attributes.position.array;
            for(let i=1; i < particlesCount*3; i+=3) {
                positions[i] += 0.03; 
                if(positions[i] > 20) positions[i] = -20; 
            }
            particlesGeo.attributes.position.needsUpdate = true;

            // Cámara movimiento suave
            scrollCurrent += (scrollTarget - scrollCurrent) * 0.1;
            camera.position.x = scrollCurrent;

            // Detección de slide activo
            const idx = Math.round(scrollCurrent / 40);
            document.querySelectorAll('.slide-content').forEach((el, i) => {
                if(i === idx) el.classList.add('active');
                else el.classList.remove('active');
            });

            renderer.render(scene, camera);
        }

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return {
            startAnimation: () => {
                isAnimating = true;
                animate();
            }
        };
    }
});
                                                
