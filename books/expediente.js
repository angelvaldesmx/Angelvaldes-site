document.addEventListener("DOMContentLoaded", () => {
    
    // --- CONFIGURACIÓN ---
    const releaseDate = new Date("2026-10-31T00:00:00").getTime(); 
    
    // --- URL DE LA API (CORREGIDA) ---
    const API_URL = "https://black-fire-dc65.angelmills982.workers.dev";

    // --- SECUENCIA DE TRANSICIÓN CINEMÁTICA ---
    const tl = gsap.timeline();

    // 1. FASE INGENUA (La Calma)
    tl.to("#phase-old", { duration: 2, opacity: 1, ease: "power2.out" })
    
    // 2. EL PRE-GLITCH (La Duda)
    .to(".old-cover", { 
        rotation: 3, duration: 0.1, yoyo: true, repeat: 5, ease: "linear" 
    })
    .to("#phase-old", { 
        filter: "invert(100%) hue-rotate(90deg)", duration: 0.05, yoyo: true, repeat: 4 
    })

    // 3. EL CORTE A NEGRO (La Muerte)
    .to("#phase-old", { display: "none", duration: 0 })
    .to("#glitch-overlay", { display: "flex", opacity: 1, duration: 0 })
    
    // 4. EL MENSAJE GLITCH ("TUVE QUE MATAR...")
    .from(".glitch-message", { 
        scale: 3, opacity: 0, duration: 0.2, ease: "elastic.out(1, 0.3)" 
    })
    .to(".glitch-message", { 
        x: 5, yoyo: true, repeat: 10, duration: 0.05 
    })
    .to({}, { duration: 1.5 }) // Pausa para leer

    // 5. EL RENACER (Antihéroe)
    .to("#glitch-overlay", { opacity: 0, display: "none", duration: 0.5 })
    .to("#countdown-layer", { 
        display: "flex", opacity: 1, 
        onComplete: () => {
            gsap.to(".halftone-overlay", { opacity: 0.4, duration: 2 });
            startCountdown();
        }
    });


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
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            
            timeEl.innerHTML = `${d}d:${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
        }, 1000);

        setTimeout(() => {
            btn.classList.remove('hidden');
            gsap.from(btn, { scale: 0, rotation: -10, duration: 0.5, ease: "back.out(1.7)" });
        }, 2000);

        btn.addEventListener('click', () => {
            gsap.to("#countdown-layer", { opacity: 0, duration: 0.8, onComplete: () => {
                document.getElementById('countdown-layer').style.display = 'none';
                init3DGallery(); 
            }});
        });
    }

    // --- GALERÍA 3D (THREE.JS) + CENIZAS ---
    function init3DGallery() {
        const galleryLayer = document.getElementById('gallery-layer');
        galleryLayer.classList.remove('hidden');
        gsap.to(galleryLayer, { opacity: 1, duration: 1 });

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.035); 

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 25);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // --- SISTEMA DE PARTÍCULAS (CENIZAS) ---
        const particlesCount = 800;
        const particlesGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i=0; i<particlesCount*3; i++) {
            posArray[i] = (Math.random() - 0.5) * 60; 
        }
        
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMat = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xFF4500, 
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particlesMesh);

        // --- CUADROS ---
        const textureLoader = new THREE.TextureLoader();
        const images = [
            'images/antiheroe-cover.jpg',  // Slide 0: Nueva
            'images/old-cover.jpg'         // Slide 1: Vieja
        ];
        
        images.forEach((url, i) => {
            const group = new THREE.Group();
            group.position.x = i * 40; 

            // Imagen
            const geo = new THREE.PlaneGeometry(12, 18);
            const mat = new THREE.MeshBasicMaterial({ map: textureLoader.load(url) });
            const mesh = new THREE.Mesh(geo, mat);

            // Borde Cómic
            const borderGeo = new THREE.PlaneGeometry(12.5, 18.5);
            const borderMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const border = new THREE.Mesh(borderGeo, borderMat);
            border.position.z = -0.1; 

            group.add(border);
            group.add(mesh);
            scene.add(group);
        });

        // --- SCROLL & RENDER ---
        let scrollTarget = 0;
        let scrollCurrent = 0;

        window.addEventListener('wheel', (e) => {
            scrollTarget += e.deltaY * 0.05;
            scrollTarget = Math.max(0, Math.min(scrollTarget, (images.length - 1) * 40));
        });

        function animate() {
            requestAnimationFrame(animate);

            // Animar cenizas
            const positions = particlesGeo.attributes.position.array;
            for(let i=1; i < particlesCount*3; i+=3) {
                positions[i] += 0.03; 
                if(positions[i] > 20) positions[i] = -20; 
            }
            particlesGeo.attributes.position.needsUpdate = true;

            scrollCurrent += (scrollTarget - scrollCurrent) * 0.1;
            camera.position.x = scrollCurrent;

            const idx = Math.round(scrollCurrent / 40);
            document.querySelectorAll('.slide-content').forEach((el, i) => {
                if(i === idx) el.classList.add('active');
                else el.classList.remove('active');
            });

            renderer.render(scene, camera);
        }
        animate();
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // --- ENVÍO DE FORMULARIO A LA API ---
        const form = document.getElementById('gallery-form');
        if(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                const input = form.querySelector('input');
                const originalText = btn.innerText;
                
                btn.innerText = "ENCRIPTANDO...";
                btn.disabled = true;

                try {
                    // LLAMADA A TU WORKER
                    const response = await fetch(API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            email: input.value, 
                            name: "Agente Antihéroe" 
                        })
                    });

                    if (response.ok) {
                        btn.innerText = "ACCESO CONCEDIDO";
                        btn.style.backgroundColor = "#00ff41"; 
                        btn.style.color = "black";
                        btn.style.borderColor = "#00ff41";
                        input.value = "";
                        
                        const desc = form.parentElement.querySelector('.description');
                        desc.innerHTML += `<br><br><span style="color:#00ff41; font-family:'Courier Prime'">>> ARCHIVO ENVIADO A TU CORREO. REVISA SPAM SI ES NECESARIO.</span>`;
                    } else {
                        throw new Error('Error en el servidor');
                    }
                } catch (error) {
                    console.error(error);
                    btn.innerText = "ERROR DE RED";
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }, 3000);
                }
            });
        }
    }
});
      
