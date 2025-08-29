import * as THREE from "https://esm.sh/three";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

gsap.registerPlugin(ScrollTrigger);

// =============================
// LENIS SCROLL
// =============================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false
});

// =============================
// VARIABLES GLOBALES
// =============================
let scrollVelocity = 0;
let targetScrollVelocity = 0;
let scrollTimeout = null;
let scrollEffectActive = false;
let allImageEffects = [];

// Resize optimized
const resizeHandlers = new Map();
let resizeTimeout = null;
function handleGlobalResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeHandlers.forEach((handler) => handler());
  }, 16);
}
window.addEventListener("resize", handleGlobalResize);

// =============================
// LENIS + SCROLL EFFECTS
// =============================
lenis.on("scroll", (data) => {
  ScrollTrigger.update();
  targetScrollVelocity = Math.abs(data.velocity) * 0.02;

  if (
    targetScrollVelocity > settings.scrollTriggerThreshold &&
    !scrollEffectActive
  ) {
    activateScrollEffect();
  }

  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    gsap.to(
      { value: scrollVelocity },
      {
        value: 0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: function () {
          scrollVelocity = this.targets()[0].value;
        },
        onComplete: () => {
          if (scrollEffectActive && scrollVelocity < 0.02) {
            deactivateScrollEffect();
          }
        }
      }
    );
  }, 50);
});

function activateScrollEffect() {
  if (scrollEffectActive) return;
  scrollEffectActive = true;

  allImageEffects.forEach((effectData) => {
    if (effectData.effect && !effectData.isHovered) {
      effectData.effect.startWithIntensity(settings.scrollEffectStrength);
      gsap.to(effectData.canvas, {
        opacity: settings.scrollEffectOpacity,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  });
}

function deactivateScrollEffect() {
  if (!scrollEffectActive) return;
  scrollEffectActive = false;

  allImageEffects.forEach((effectData) => {
    if (effectData.effect && !effectData.isHovered) {
      effectData.effect.stop();
      gsap.to(effectData.canvas, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  });
}

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);

  scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.15;

  document.querySelectorAll(".image-box").forEach((box) => {
    const img = box.querySelector("img");
    const isHovered = box.matches(":hover");

    if (scrollVelocity > 0.001 && !isHovered) {
      const strength = Math.min(scrollVelocity * 10, 0.1);
      img.style.filter = `grayscale(100%) contrast(1.2) 
                drop-shadow(${strength}px 0 0 #ff0000) 
                drop-shadow(-${strength}px 0 0 #00ffff)`;
    } else if (!isHovered) {
      img.style.filter = "grayscale(100%) contrast(1.2)";
    }
  });
});
gsap.ticker.lagSmoothing(0);

// =============================
// CONFIGURACIÓN EFECTOS
// =============================
const ANIMATION_TIMING = {
  hover: { duration: 0.64, ease: "cubic-bezier(0.23, 1, 0.32, 1)" },
  title: { duration: 0.2, ease: "cubic-bezier(0.23, 1, 0.32, 1)" },
  fisheye: { start: 0.64, stop: 0.64, ease: "cubic-bezier(0.23, 1, 0.32, 1)" },
  debug: { duration: 0.3, ease: "power2.inOut" }
};

const settings = {
  fisheyeStrength: 1.0,
  vignetteStart: 0.3,
  vignetteEnd: 0.8,
  fisheyeRadius: 0.8,
  chromaticAberration: 0.015,
  noiseIntensity: 0.08,
  vignetteIntensity: 0.32,
  mouseEffect: 0.02,
  mouseRadius: 0.3,
  animationDuration: 0.64,
  canvasOpacity: 1.0,
  showVignetteMask: false,
  scrollEffectStrength: 0.7,
  scrollEffectOpacity: 0.6,
  scrollTriggerThreshold: 0.08
};

// =============================
// SLIDE BAR
// =============================
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarClose = document.querySelector(".sidebar .close-btn");
const sidebarLinks = document.querySelectorAll(".sidebar ul li a"); 

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}
if (sidebarClose) {
  sidebarClose.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
}

sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebar.classList.remove("open");
    });
});

// =============================
// THEME TOGGLE (oscuro/claro)
// =============================
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("light-theme");
    themeToggle.textContent =
      document.documentElement.classList.contains("light-theme")
        ? "🌞"
        : "🌗";
  });
}

// =============================
// MODALES
// =============================
const triggers = document.querySelectorAll(".modal-trigger");
const modals = document.querySelectorAll(".modal");

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const modalId = trigger.getAttribute("data-modal");
    document.getElementById(modalId)?.classList.add("open");
  });
});

modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal") ||
      e.target.classList.contains("close-btn") ||
      e.target.classList.contains("close-intro")
    ) {
      modal.classList.remove("open");
    }
  });
});


// =============================================================
// ===== INICIO DE LA SECCIÓN DE EFECTOS THREE.JS (COMPLETADO) =====
// =============================================================

function createVignetteFisheyeDistortion(canvas, imgElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imgElement.src);
  texture.colorSpace = THREE.SRGBColorSpace;

  const uniforms = {
    uTexture: { value: texture },
    uResolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uFisheyeStrength: { value: 0.0 },
    uVignetteStart: { value: settings.vignetteStart },
    uVignetteEnd: { value: settings.vignetteEnd },
    uFisheyeRadius: { value: settings.fisheyeRadius },
    uChromaticAberration: { value: settings.chromaticAberration },
    uNoiseIntensity: { value: settings.noiseIntensity },
    uVignetteIntensity: { value: settings.vignetteIntensity },
    uMouseEffect: { value: settings.mouseEffect },
    uMouseRadius: { value: settings.mouseRadius }
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uTime;
    uniform float uFisheyeStrength;
    uniform float uVignetteStart;
    uniform float uVignetteEnd;
    uniform float uFisheyeRadius;
    uniform float uChromaticAberration;
    uniform float uNoiseIntensity;
    uniform float uVignetteIntensity;
    uniform float uMouseEffect;
    uniform float uMouseRadius;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec2 barrelDistortion(vec2 uv, float strength) {
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = uv - center;
      float dist = dot(toCenter, toCenter);
      return uv + toCenter * dist * strength;
    }

    void main() {
      vec2 uv = vUv;
      
      // Mouse interaction
      float mouseDist = distance(uv, uMouse);
      float mouseStrength = smoothstep(uMouseRadius, 0.0, mouseDist);
      vec2 mouseOffset = (uv - uMouse) * mouseStrength * uMouseEffect;
      uv -= mouseOffset;

      // Fisheye effect
      vec2 distortedUv = barrelDistortion(uv, uFisheyeStrength * uFisheyeRadius);
      
      // Chromatic Aberration
      vec4 originalColor;
      if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
        originalColor = vec4(0.0);
      } else {
        float r = texture2D(uTexture, barrelDistortion(uv, (uFisheyeStrength + uChromaticAberration) * uFisheyeRadius)).r;
        float g = texture2D(uTexture, distortedUv).g;
        float b = texture2D(uTexture, barrelDistortion(uv, (uFisheyeStrength - uChromaticAberration) * uFisheyeRadius)).b;
        originalColor = vec4(r, g, b, texture2D(uTexture, distortedUv).a);
      }

      // Vignette
      float distToCenter = distance(uv, vec2(0.5));
      float vignette = smoothstep(uVignetteEnd, uVignetteStart, distToCenter);
      vignette = pow(vignette, uVignetteIntensity);
      
      // Noise
      float noise = (random(uv * uTime) - 0.5) * uNoiseIntensity;
      
      vec4 finalColor = originalColor * vignette + noise;
      gl_FragColor = finalColor;
    }
  `;
  
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.updateProjectionMatrix();
    uniforms.uResolution.value.set(width, height);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  
  resizeHandlers.set(canvas, resize);
  
  let animationFrameId = null;
  function render(time) {
    uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(render);
  }

  return {
    start() {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
      gsap.to(uniforms.uFisheyeStrength, {
        value: settings.fisheyeStrength,
        duration: ANIMATION_TIMING.fisheye.start,
        ease: ANIMATION_TIMING.fisheye.ease,
      });
    },
    stop() {
      gsap.to(uniforms.uFisheyeStrength, {
        value: 0,
        duration: ANIMATION_TIMING.fisheye.stop,
        ease: ANIMATION_TIMING.fisheye.ease,
        onComplete: () => {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    },
    startWithIntensity(intensity) {
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
        }
        uniforms.uFisheyeStrength.value = intensity;
    },
    updateMouse(x, y) {
      uniforms.uMouse.value.set(x, y);
    },
    uniforms
  };
}


function createHoverAnimation(box, effect, canvas, img) {
    let mouseMoveHandler = null;

    box.addEventListener("mouseenter", () => {
        allImageEffects.find(e => e.canvas === canvas).isHovered = true;
        effect.start();
        gsap.to(canvas, { opacity: 1, duration: ANIMATION_TIMING.hover.duration, ease: ANIMATION_TIMING.hover.ease });
        gsap.to(img, { filter: "grayscale(0%) contrast(1)", duration: 0.3 });

        mouseMoveHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            effect.updateMouse(x, 1 - y);
        };
        window.addEventListener("mousemove", mouseMoveHandler);
    });

    box.addEventListener("mouseleave", () => {
        allImageEffects.find(e => e.canvas === canvas).isHovered = false;
        effect.stop();
        gsap.to(canvas, { opacity: 0, duration: ANIMATION_TIMING.hover.duration, ease: ANIMATION_TIMING.hover.ease });
        gsap.to(img, { filter: "grayscale(100%) contrast(1.2)", duration: 0.3 });
        if (mouseMoveHandler) {
            window.removeEventListener("mousemove", mouseMoveHandler);
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const imageBoxes = document.querySelectorAll(".image-box");
    imageBoxes.forEach((box) => {
        const img = box.querySelector("img");
        const canvas = box.querySelector("canvas.threejs-canvas");
        
        if (img && canvas) {
            img.onload = () => {
                const effect = createVignetteFisheyeDistortion(canvas, img);
                createHoverAnimation(box, effect, canvas, img);
                
                allImageEffects.push({
                    effect,
                    canvas,
                    isHovered: false
                });
            };
            if (img.complete) {
                img.onload();
            }
        }
    });
});