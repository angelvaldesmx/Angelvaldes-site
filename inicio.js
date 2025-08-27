// Direction constants
const NEXT = 1;
const PREV = -1;

// Slide titles array
const slideTitles = [
  "Cosmic Harmony",
  "Astral Journey",
  "Ethereal Vision",
  "Quantum Field",
  "Celestial Path",
  "Cosmic Whisper"
];

// Global state
let currentHoveredThumb = null;
let mouseOverThumbnails = false;
let lastHoveredThumbIndex = null;
let isAnimating = false;
let pendingNavigation = null;

// Update navigation UI
function updateNavigationUI(disabled) {
  document.querySelectorAll(".counter-nav").forEach(btn => {
    btn.style.opacity = disabled ? "0.3" : "";
    btn.style.pointerEvents = disabled ? "none" : "";
  });
  document.querySelectorAll(".slide-thumb").forEach(thumb => {
    thumb.style.pointerEvents = disabled ? "none" : "";
  });
}

// Slide counter
function updateSlideCounter(index) {
  const currentSlideEl = document.querySelector(".current-slide");
  if (currentSlideEl) currentSlideEl.textContent = String(index + 1).padStart(2, "0");
}

// Slide title animation
function updateSlideTitle(index) {
  const titleContainer = document.querySelector(".slide-title-container");
  const currentTitle = document.querySelector(".slide-title");
  if (!titleContainer || !currentTitle) return;

  const newTitle = document.createElement("div");
  newTitle.className = "slide-title enter-up";
  newTitle.textContent = slideTitles[index];
  titleContainer.appendChild(newTitle);

  currentTitle.classList.add("exit-up");
  void newTitle.offsetWidth;

  setTimeout(() => newTitle.classList.remove("enter-up"), 10);
  setTimeout(() => currentTitle.remove(), 500);
}

// Drag lines update
function updateDragLines(activeIndex, forceUpdate = false) {
  const lines = document.querySelectorAll(".drag-line");
  if (!lines.length) return;

  lines.forEach(line => {
    line.style.height = "var(--line-base-height)";
    line.style.backgroundColor = "rgba(255,62,192,0.3)";
  });

  if (activeIndex === null) return;

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
      const opacity = 0.3 + waveHeight * 0.5;
      const delay = normalizedDist * 100;

      if (forceUpdate) {
        lines[i].style.height = `${height}px`;
        lines[i].style.backgroundColor = `rgba(255,62,192,${opacity})`;
      } else {
        setTimeout(() => {
          if (currentHoveredThumb === activeIndex || (mouseOverThumbnails && lastHoveredThumbIndex === activeIndex)) {
            lines[i].style.height = `${height}px`;
            lines[i].style.backgroundColor = `rgba(255,62,192,${opacity})`;
          }
        }, delay);
      }
    }
  }
}

// Slideshow class
class Slideshow {
  DOM = { el: null, slides: null, slidesInner: null };
  current = 0;
  slidesTotal = 0;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.slides = [...this.DOM.el.querySelectorAll(".slide")];
    this.DOM.slidesInner = this.DOM.slides.map(slide => slide.querySelector(".slide__img"));
    this.DOM.slides[this.current].classList.add("slide--current");
    this.slidesTotal = this.DOM.slides.length;
  }

  next() { this.navigate(NEXT); }
  prev() { this.navigate(PREV); }

  goTo(index) {
    if (isAnimating) { pendingNavigation = { type: "goto", index }; return false; }
    if (index === this.current) return false;

    isAnimating = true;
    updateNavigationUI(true);

    const previous = this.current;
    this.current = index;

    document.querySelectorAll(".slide-thumb").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });

    updateSlideCounter(index);
    updateSlideTitle(index);
    updateDragLines(index, true);

    const direction = index > previous ? 1 : -1;
    const currentSlide = this.DOM.slides[previous];
    const currentInner = this.DOM.slidesInner[previous];
    const upcomingSlide = this.DOM.slides[index];
    const upcomingInner = this.DOM.slidesInner[index];

    gsap.timeline({
      onStart: () => { this.DOM.slides[index].classList.add("slide--current"); gsap.set(upcomingSlide, { zIndex: 99 }); },
      onComplete: () => {
        this.DOM.slides[previous].classList.remove("slide--current");
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

  navigate(direction) {
    if (isAnimating) { pendingNavigation = { type: "navigate", direction }; return false; }

    isAnimating = true;
    updateNavigationUI(true);

    const previous = this.current;
    this.current = direction === 1 ? (this.current < this.slidesTotal - 1 ? ++this.current : 0) : (this.current > 0 ? --this.current : this.slidesTotal - 1);

    document.querySelectorAll(".slide-thumb").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === this.current);
    });

    updateSlideCounter(this.current);
    updateSlideTitle(this.current);
    updateDragLines(this.current, true);

    const currentSlide = this.DOM.slides[previous];
    const currentInner = this.DOM.slidesInner[previous];
    const upcomingSlide = this.DOM.slides[this.current];
    const upcomingInner = this.DOM.slidesInner[this.current];

    gsap.timeline({
      onStart: () => { this.DOM.slides[this.current].classList.add("slide--current"); gsap.set(upcomingSlide, { zIndex: 99 }); },
      onComplete: () => {
        this.DOM.slides[previous].classList.remove("slide--current");
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

// Initialize slideshow
document.addEventListener("DOMContentLoaded", () => {
  const slidesEl = document.querySelector(".slides");
  const slideshow = new Slideshow(slidesEl);

  const thumbsContainer = document.querySelector(".slide-thumbs");
  const slideImgs = document.querySelectorAll(".slide__img");
  const slideCount = slideImgs.length;

  thumbsContainer.innerHTML = "";
  slideImgs.forEach((img, index) => {
    const thumb = document.createElement("div");
    thumb.className = "slide-thumb";
    thumb.style.backgroundImage = img.style.backgroundImage;
    if (index === 0) thumb.classList.add("active");

    thumb.addEventListener("click", () => { lastHoveredThumbIndex = index; slideshow.goTo(index); });
    thumb.addEventListener("mouseenter", () => { currentHoveredThumb = index; lastHoveredThumbIndex = index; mouseOverThumbnails = true; if (!isAnimating) updateDragLines(index, true); });
    thumb.addEventListener("mouseleave", () => { if (currentHoveredThumb === index) currentHoveredThumb = null; });

    thumbsContainer.appendChild(thumb);
  });

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
  if (totalSlidesEl) totalSlidesEl.textContent = String(slideCount).padStart(2, "0");

  document.querySelector(".prev-slide")?.addEventListener("click", () => slideshow.prev());
  document.querySelector(".next-slide")?.addEventListener("click", () => slideshow.next());

  updateSlideCounter(0);
  updateDragLines(0, true);

  const thumbsArea = document.querySelector(".thumbs-container");
  if (thumbsArea) {
    thumbsArea.addEventListener("mouseenter", () => mouseOverThumbnails = true);
    thumbsArea.addEventListener("mouseleave", () => { mouseOverThumbnails = false; currentHoveredThumb = null; updateDragLines(null); });
  }

  // Keyboard navigation
  document.addEventListener("keydown", e => { if (isAnimating) return; if (e.key === "ArrowRight") slideshow.next(); else if (e.key === "ArrowLeft") slideshow.prev(); });
});
