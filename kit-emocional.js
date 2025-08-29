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
// CONFIGURACIÓN EFECTOS (original + tweakpane)
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

// Pane debug
const allEffects = [];
const pane = new Pane({ title: "Fisheye Controls" });
// ... aquí sigue la configuración de tweakpane (idéntica al original) ...

// =============================
// SLIDE BAR
// =============================
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarClose = document.querySelector(".sidebar .close-btn");

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
      e.target.classList.contains("close-btn")
    ) {
      modal.classList.remove("open");
    }
  });
});

// =============================
// INIT EFECTOS SOBRE GRID
// =============================
// (idéntico al original, createVignetteFisheyeDistortion, createHoverAnimation, etc.)