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
let lastHoveredThumbIndex = null;

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
          if (currentHoveredThumb === activeIndex || (mouseOverThumbnails && lastHoveredThumbIndex === activeIndex)) {
            lines[i].style.height = `${height}px`;
            lines[i].style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
          }
        }, delay);
      }
    }
  }
}

  // ... (código existente del inicio de tu test.js)

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
        // Usamos 'click' para la navegación y 'dblclick' para el modal
        // Esto es una mejora para evitar que el modal se abra por accidente
        slide.addEventListener('dblclick', (e) => this.openModal(e, index));
        slide.addEventListener('click', (e) => {
          // En un solo clic, solo navega si no es el slide actual
          if (index !== this.current) {
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

    openModal(e, index) {
      e.preventDefault();
      const slide = this.DOM.slides[index];
      const url = slide.dataset.url;
      const desc = slide.dataset.description;
      const imgSrc = slide.querySelector('.slide__img').src; // Corregido: Ahora busca la clase .slide__img

      this.DOM.modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      this.DOM.modalImg.src = imgSrc;
      this.DOM.modalDesc.textContent = desc || "Descubre más en esta sección.";
      this.DOM.modalBtn.setAttribute('data-url', url);
    }

    closeModal() {
      this.DOM.modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }

    visitSite() {
      const progressBar = document.querySelector('#modalProgress .progress-fill');
      const progressContainer = document.getElementById('modalProgress');
      progressContainer.style.display = 'block';
      progressBar.style.width = '0%';
      void progressBar.offsetWidth;
      progressBar.style.width = '100%';
      setTimeout(() => {
        const url = this.DOM.modalBtn.getAttribute('data-url');
        if (url) window.location.href = url;
      }, 3000);
    }

    // ... (métodos next, prev, goTo, navigate, animateSlides sin cambios)
  }

  // ... (código existente del resto de tu test.js, sin cambios)

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
    updateDragLines(current, true);

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
          if (pendingNavigation) {
            const { type, index, direction } = pendingNavigation;
            pendingNavigation = null;
            setTimeout(() => {
              if (type === "goto") this.goTo(index);
              else if (type === "navigate") this.navigate(direction);
            }, 50);
          }
          if (mouseOverThumbnails && lastHoveredThumbIndex !== null) {
            currentHoveredThumb = lastHoveredThumbIndex;
            updateDragLines(lastHoveredThumbIndex, true);
          }
        }
      })
      .addLabel("start", 0)
      .fromTo(upcomingSlide, { autoAlpha: 1, scale: 0.1, yPercent: direction === 1 ? 100 : -100 }, { duration: 0.7, ease: "expo", scale: 0.4, yPercent: 0 }, "start")
      .fromTo(upcomingInner, { filter: "contrast(100%) saturate(100%)", transformOrigin: "100% 50%", scaleY: 4 }, { duration: 0.7, ease: "expo", scaleY: 1 }, "start")
      .fromTo(currentInner, { filter: "contrast(100%) saturate(100%)" }, { duration: 0.7, ease: "expo", filter: "contrast(120%) saturate(140%)" }, "start")
      .addLabel("middle", "start+=0.6")
      .to(upcomingSlide, { duration: 1, ease: "power4.inOut", scale: 1 }, "middle")
      .to(currentSlide, { duration: 1, ease: "power4.inOut", scale: 0.98, autoAlpha: 0 }, "middle");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelector(".slides");
  const slideshow = new Slideshow(slides);

  const thumbsContainer = document.querySelector(".slide-thumbs");
  const slideImgs = document.querySelectorAll(".slide__img-container img");
  const slideCount = slideImgs.length;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";
    slideImgs.forEach((img, index) => {
      const thumb = document.createElement("div");
      thumb.className = "slide-thumb";
      thumb.style.backgroundImage = `url('${img.src}')`;
      if (index === 0) {
        thumb.classList.add("active");
      }
      thumb.addEventListener("click", () => {
        lastHoveredThumbIndex = index;
        slideshow.goTo(index);
      });
      thumb.addEventListener("mouseenter", () => {
        currentHoveredThumb = index;
        lastHoveredThumbIndex = index;
        mouseOverThumbnails = true;
        if (!isAnimating) {
          updateDragLines(index, true);
        }
      });
      thumb.addEventListener("mouseleave", () => {
        if (currentHoveredThumb === index) {
          currentHoveredThumb = null;
        }
      });
      thumbsContainer.appendChild(thumb);
    });
  }

  const dragIndicator = document.querySelector(".drag-indicator");
  if (dragIndicator) {
    dragIndicator.innerHTML = "";
    const linesContainer = document.createElement("div");
    linesContainer.className = "lines-container";
    dragIndicator.appendChild(linesContainer);
    const totalLines = 60;
    for (let i = 0; i < totalLines; i++) {
      const line = document.createElement("div");
      line.className = "drag-line";
      linesContainer.appendChild(line);
    }
  }

  const totalSlidesEl = document.querySelector(".total-slides");
  if (totalSlidesEl) {
    totalSlidesEl.textContent = String(slideCount).padStart(2, "0");
  }

  const prevButton = document.querySelector(".prev-slide");
  const nextButton = document.querySelector(".next-slide");

  if (prevButton) {
    prevButton.addEventListener("click", () => slideshow.prev());
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => slideshow.next());
  }

  updateSlideCounter(0);
  updateDragLines(0, true);

  const thumbsArea = document.querySelector(".thumbs-container");
  if (thumbsArea) {
    thumbsArea.addEventListener("mouseenter", () => mouseOverThumbnails = true);
    thumbsArea.addEventListener("mouseleave", () => {
      mouseOverThumbnails = false;
      currentHoveredThumb = null;
      updateDragLines(null);
    });
  }

  try {
    if (typeof Observer !== "undefined") {
      Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => { if (!isAnimating) slideshow.prev(); },
        onUp: () => { if (!isAnimating) slideshow.next(); },
        wheelSpeed: -1,
        tolerance: 10
      });
    } else if (typeof gsap.Observer !== "undefined") {
      gsap.Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => { if (!isAnimating) slideshow.prev(); },
        onUp: () => { if (!isAnimating) slideshow.next(); },
        wheelSpeed: -1,
        tolerance: 10
      });
    } else {
      console.warn("GSAP Observer plugin not found, using fallback");
      document.addEventListener("wheel", (e) => {
        if (isAnimating) return;
        if (e.deltaY > 0) slideshow.next();
        else slideshow.prev();
      });
      let touchStartY = 0;
      document.addEventListener("touchstart", (e) => touchStartY = e.touches[0].clientY);
      document.addEventListener("touchend", (e) => {
        if (isAnimating) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartY;
        if (Math.abs(diff) > 50) {
          if (diff > 0) slideshow.prev();
          else slideshow.next();
        }
      });
    }
  } catch (error) {
    console.error("Error initializing Observer:", error);
  }

  document.addEventListener("keydown", (e) => {
    if (isAnimating) return;
    if (e.key === "ArrowRight") slideshow.next();
    else if (e.key === "ArrowLeft") slideshow.prev();
  });
});