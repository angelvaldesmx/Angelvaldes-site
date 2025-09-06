// Direction constants
const NEXT = 1;
const PREV = -1;

// Slide titles array (global)
const slideTitles = [
  "Presentación", // Título para el primer slide
  "Kit Emocional",
  "Blog",
  "Música & Podcast",
  "Libros",
  "Tienda",
  "Crypto",
  "Dimensiones",
  "Newsletter"
];

// Global variable to track currently hovered thumbnail
let currentHoveredThumb = null;

// Global variable to track mouse position over thumbnails
let mouseOverThumbnails = false;

// Global animation state management
let isAnimating = false;
let pendingNavigation = null;

// Function to visually update navigation elements based on animation state
function updateNavigationUI(disabled) {
  const navButtons = document.querySelectorAll(".counter-nav");
  navButtons.forEach((btn) => {
    btn.style.opacity = disabled ? "0.3" : "";
    btn.style.pointerEvents = disabled ? "none" : "";
  });
  const thumbs = document.querySelectorAll(".slide-thumb");
  thumbs.forEach((thumb) => {
    thumb.style.pointerEvents = disabled ? "none" : "";
  });
}

function updateSlideCounter(index) {
  const currentSlideEl = document.querySelector(".current-slide");
  if (currentSlideEl) {
    currentSlideEl.textContent = String(index + 1).padStart(2, "0");
  }
}

function updateSlideTitle(index) {
  const titleContainer = document.querySelector(".slide-title-container");
  const currentTitle = document.querySelector(".slide-title");
  if (!titleContainer || !currentTitle) return;

  const newTitle = document.createElement("div");
  newTitle.className = "slide-title enter-up";
  newTitle.textContent = slideTitles[index];

  titleContainer.appendChild(newTitle);
  currentTitle.classList.add("exit-up");

  void newTitle.offsetWidth; // Force reflow

  setTimeout(() => {
    newTitle.classList.remove("enter-up");
  }, 10);

  setTimeout(() => {
    currentTitle.remove();
  }, 500);
}

function updateDragLines(activeIndex, forceUpdate = false) {
  const lines = document.querySelectorAll(".drag-line");
  if (!lines.length) return;

  lines.forEach((line) => {
    line.style.height = "var(--line-base-height)";
    line.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  });

  if (activeIndex === null) {
    return;
  }

  const slideCount = document.querySelectorAll(".slide").length;
  const lineCount = lines.length;
  const thumbWidth = 720 / slideCount;
  const centerPosition = (activeIndex + 0.5) * thumbWidth;
  const lineWidth = 720 / lineCount;

  for (let i = 0; i < lineCount; i++) {
    const linePosition = (i + 0.5) * lineWidth;
    const distFromCenter = Math.abs(linePosition - centerPosition);
    const maxDistance = thumbWidth * 0.7;

    if (distFromCenter <= maxDistance) {
      const normalizedDist = distFromCenter / maxDistance;
      const waveHeight = Math.cos((normalizedDist * Math.PI) / 2);
      const height = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--line-base-height")) + waveHeight * 35;
      const opacity = 0.3 + waveHeight * 0.4;
      const delay = normalizedDist * 100;

      if (forceUpdate) {
        lines[i].style.height = `${height}px`;
        lines[i].style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      } else {
        setTimeout(() => {
          // Asegura que la animación solo ocurra si el ratón sigue sobre el thumbnail correcto
          if (currentHoveredThumb === activeIndex) {
            lines[i].style.height = `${height}px`;
            lines[i].style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
          }
        }, delay);
      }
    }
  }
}

class Slideshow {
  DOM = {
    el: null,
    slides: null,
    slidesInner: null,
    modal: null,
    modalImg: null,
    modalDesc: null,
    modalBtn: null,
    modalClose: null
  };
  current = 0;
  slidesTotal = 0;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.slides = [...this.DOM.el.querySelectorAll(".slide")];
    this.DOM.slidesInner = this.DOM.slides.map((item) => item.querySelector(".slide__img-container img"));
    this.DOM.slides[this.current].classList.add("slide--current");
    this.slidesTotal = this.DOM.slides.length;

    // Initialize modal DOM elements
    this.DOM.modal = document.getElementById('modal');
    this.DOM.modalImg = document.getElementById('modalImg');
    this.DOM.modalDesc = document.getElementById('modalDesc');
    this.DOM.modalBtn = document.getElementById('modalBtn');
    this.DOM.modalClose = document.getElementById('modalClose');

    this.initEvents();
  }

  initEvents() {
    this.DOM.slides.forEach((slide, index) => {
      // Usamos 'click' para la navegación principal y ahora también para abrir el modal.
      // El doble clic ya no es necesario para el modal, mejorando la experiencia en touch.
      slide.addEventListener('click', () => {
        if (index === this.current) {
          // Si es el slide actual, abre el modal
          this.openModal(index);
        } else {
          // Si es un slide diferente, navega a él
          this.goTo(index);
        }
      });
    });
    this.DOM.modalClose.addEventListener('click', () => this.closeModal());
    this.DOM.modal.addEventListener('click', (e) => {
      if (e.target === this.DOM.modal) {
        this.closeModal();
      }
    });
    this.DOM.modalBtn.addEventListener('click', () => this.visitSite());
  }

  openModal(index) {
    const slide = this.DOM.slides[index];
    const url = slide.dataset.url;
    const desc = slide.dataset.description;
    // Aseguramos que la imagen se obtenga correctamente
    const imgSrc = slide.querySelector('.slide__img')?.src; 

    // Si no se puede obtener la imagen, no abrimos el modal
    if (!imgSrc) {
        console.error("No se pudo obtener la URL de la imagen para el modal en el slide:", index);
        return;
    }

    this.DOM.modal.style.display = 'flex';
    document.body.classList.add('modal-open'); // Añade clase para aplicar blur al fondo
    this.DOM.modalImg.src = imgSrc;
    this.DOM.modalDesc.textContent = desc || "Descubre más en esta sección.";
    this.DOM.modalBtn.setAttribute('data-url', url);

    // Muestra u oculta el botón "Visitar sitio" y la barra de progreso
    // solo si hay una URL definida en el dataset del slide.
    if (url) {
      this.DOM.modalBtn.style.display = 'block';
      document.getElementById('modalProgress').style.display = 'block';
    } else {
      this.DOM.modalBtn.style.display = 'none';
      document.getElementById('modalProgress').style.display = 'none';
    }
  }

  closeModal() {
    this.DOM.modal.style.display = 'none';
    document.body.classList.remove('modal-open'); // Remueve clase para quitar el blur
  }

  visitSite() {
    const progressBar = document.querySelector('#modalProgress .progress-fill');
    const progressContainer = document.getElementById('modalProgress');
    progressContainer.style.display = 'block'; // Asegurar que está visible
    progressBar.style.width = '0%'; // Reiniciar la barra de progreso
    void progressBar.offsetWidth; // Forzar reflow para que la animación se aplique
    progressBar.style.width = '100%'; // Iniciar animación

    setTimeout(() => {
      const url = this.DOM.modalBtn.getAttribute('data-url');
      if (url) {
        window.location.href = url; // Redirige si hay URL
      } else {
        this.closeModal(); // Si no hay URL, solo cierra el modal
      }
    }, 3000); // Duración de la animación de la barra de progreso
  }

  next() {
    this.navigate(NEXT);
  }

  prev() {
    this.navigate(PREV);
  }

  goTo(index) {
    if (isAnimating || index === this.current) return false;
    isAnimating = true;
    updateNavigationUI(true);

    const previous = this.current;
    this.current = index;

    const direction = index > previous ? 1 : -1;
    this.animateSlides(previous, this.current, direction);
  }

  navigate(direction) {
    if (isAnimating) {
      pendingNavigation = { type: "navigate", direction };
      return false;
    }
    isAnimating = true;
    updateNavigationUI(true);

    const previous = this.current;
    this.current = direction === 1 ? (this.current < this.slidesTotal - 1 ? ++this.current : 0) : (this.current > 0 ? --this.current : this.slidesTotal - 1);

    this.animateSlides(previous, this.current, direction);
  }

  animateSlides(previous, current, direction) {
    // Update UI elements
    const thumbs = document.querySelectorAll(".slide-thumb");
    thumbs.forEach((thumb, index) => thumb.classList.toggle("active", index === current));
    updateSlideCounter(current);
    updateSlideTitle(current);
    updateDragLines(current, true); // Actualiza las líneas de drag de forma forzada

    // Get slides and perform animation
    const currentSlide = this.DOM.slides[previous];
    const currentInner = this.DOM.slidesInner[previous];
    const upcomingSlide = this.DOM.slides[current];
    const upcomingInner = this.DOM.slidesInner[current];

    gsap.timeline({
        onStart: () => {
          upcomingSlide.classList.add("slide--current");
          gsap.set(upcomingSlide, { zIndex: 99 });
        },
        onComplete: () => {
          currentSlide.classList.remove("slide--current");
          gsap.set(upcomingSlide, { zIndex: 1 });
          isAnimating = false;
          updateNavigationUI(false);
          // Manejar navegación pendiente si la hubo mientras animaba
          if (pendingNavigation) {
            const { type, index, direction } = pendingNavigation;
            pendingNavigation = null;
            setTimeout(() => {
              if (type === "goto") this.goTo(index);
              else if (type === "navigate") this.navigate(direction);
            }, 50);
          }
          // Si el ratón sigue sobre los thumbnails, actualiza las líneas de drag
          if (mouseOverThumbnails && currentHoveredThumb !== null) {
            updateDragLines(currentHoveredThumb, true);
          }
        }
      })
      .addLabel("start", 0)
      // Animación del slide que entra
      .fromTo(upcomingSlide, { autoAlpha: 1, scale: 0.1, yPercent: direction === 1 ? 100 : -100 }, { duration: 0.7, ease: "expo", scale: 0.4, yPercent: 0 }, "start")
      .fromTo(upcomingInner, { filter: "contrast(100%) saturate(100%)", transformOrigin: "100% 50%", scaleY: 4 }, { duration: 0.7, ease: "expo", scaleY: 1 }, "start")
      // Animación del slide actual (se desvanece y distorsiona levemente)
      .fromTo(currentInner, { filter: "contrast(100%) saturate(100%)" }, { duration: 0.7, ease: "expo", filter: "contrast(120%) saturate(140%)" }, "start")
      .addLabel("middle", "start+=0.6")
      // Finaliza la escala del slide entrante
      .to(upcomingSlide, { duration: 1, ease: "power4.inOut", scale: 1 }, "middle")
      // Desvanece el slide saliente
      .to(currentSlide, { duration: 1, ease: "power4.inOut", scale: 0.98, autoAlpha: 0 }, "middle");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelector(".slides");
  const slideshow = new Slideshow(slides);

  const thumbsContainer = document.querySelector(".slide-thumbs");
  const slideImgs = document.querySelectorAll(".slide__img-container img");
  const slideCount = slideImgs.length;

  // Inicialización de los thumbnails
  if (thumbsContainer) {
    thumbsContainer.innerHTML = ""; // Limpiar por si acaso
    slideImgs.forEach((img, index) => {
      const thumb = document.createElement("div");
      thumb.className = "slide-thumb";
      thumb.style.backgroundImage = `url('${img.src}')`;
      if (index === 0) {
        thumb.classList.add("active"); // Activar el primer thumbnail
      }
      thumb.addEventListener("click", () => {
        // Navega al slide correspondiente al hacer clic en el thumbnail
        slideshow.goTo(index);
      });
      thumb.addEventListener("mouseenter", () => {
        currentHoveredThumb = index; // Guarda el índice del thumbnail sobre el que está el ratón
        mouseOverThumbnails = true; // Indica que el ratón está sobre el área de thumbnails
        if (!isAnimating) {
          updateDragLines(index, true); // Actualiza las líneas de drag inmediatamente
        }
      });
      thumb.addEventListener("mouseleave", () => {
        if (currentHoveredThumb === index) {
          currentHoveredThumb = null; // Limpia si el ratón sale del thumbnail actual
        }
        // Solo se quita el hover si el ratón sale completamente del área de thumbnails
        // Esto se maneja mejor con el evento del container
      });
      thumbsContainer.appendChild(thumb);
    });
  }

  // Inicialización del indicador de arrastre (drag indicator)
  const dragIndicator = document.querySelector(".drag-indicator");
  if (dragIndicator) {
    dragIndicator.innerHTML = "";
    const linesContainer = document.createElement("div");
    linesContainer.className = "lines-container";
    dragIndicator.appendChild(linesContainer);
    const totalLines = 60; // Número de líneas para el efecto visual
    for (let i = 0; i < totalLines; i++) {
      const line = document.createElement("div");
      line.className = "drag-line";
      linesContainer.appendChild(line);
    }
  }

  // Actualizar el contador total de slides
  const totalSlidesEl = document.querySelector(".total-slides");
  if (totalSlidesEl) {
    totalSlidesEl.textContent = String(slideCount).padStart(2, "0");
  }

  // Event listeners para botones de navegación
  const prevButton = document.querySelector(".prev-slide");
  const nextButton = document.querySelector(".next-slide");

  if (prevButton) {
    prevButton.addEventListener("click", () => slideshow.prev());
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => slideshow.next());
  }

  updateSlideCounter(0); // Actualiza el contador inicial
  updateDragLines(0, true); // Actualiza las líneas de drag para el primer slide

  // Event listeners para el área de thumbnails para gestionar el hover
  const thumbsArea = document.querySelector(".thumbs-container");
  if (thumbsArea) {
    thumbsArea.addEventListener("mouseenter", () => mouseOverThumbnails = true);
    thumbsArea.addEventListener("mouseleave", () => {
      mouseOverThumbnails = false;
      currentHoveredThumb = null;
      updateDragLines(null); // Limpia las líneas de drag cuando el ratón sale del área
    });
  }

  // Configuración del Observer para detectar scroll, touch, y pointer events
  try {
    if (typeof Observer !== "undefined") { // Si se usa una versión global de Observer
      Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => { if (!isAnimating) slideshow.prev(); }, // Swipe/scroll hacia abajo = anterior
        onUp: () => { if (!isAnimating) slideshow.next(); }, // Swipe/scroll hacia arriba = siguiente
        wheelSpeed: -1, // Invertir la dirección del scroll
        tolerance: 10 // Tolerancia para el swipe
      });
    } else if (typeof gsap.Observer !== "undefined") { // Si se usa GSAP Observer
      gsap.Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => { if (!isAnimating) slideshow.prev(); },
        onUp: () => { if (!isAnimating) slideshow.next(); },
        wheelSpeed: -1,
        tolerance: 10
      });
    } else { // Fallback si no se encuentra Observer
      console.warn("GSAP Observer plugin not found, using fallback");
      // Event listener para scroll del ratón
      document.addEventListener("wheel", (e) => {
        if (isAnimating) return;
        if (e.deltaY > 0) slideshow.next(); // Scroll hacia abajo = siguiente
        else slideshow.prev(); // Scroll hacia arriba = anterior
      });
      // Event listeners para touch
      let touchStartY = 0;
      document.addEventListener("touchstart", (e) => touchStartY = e.touches[0].clientY);
      document.addEventListener("touchend", (e) => {
        if (isAnimating) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;
        if (Math.abs(diff) > 50) { // Umbral para considerar un swipe válido
          if (diff > 0) slideshow.prev(); // Swipe hacia abajo = anterior
          else slideshow.next(); // Swipe hacia arriba = siguiente
        }
      });
    }
  } catch (error) {
    console.error("Error initializing Observer:", error);
  }

  // Event listener para teclas del teclado
  document.addEventListener("keydown", (e) => {
    if (isAnimating) return;
    if (e.key === "ArrowRight") slideshow.next();
    else if (e.key === "ArrowLeft") slideshow.prev();
  });
});