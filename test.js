// Direction constants
const NEXT = 1;
const PREV = -1;

// Slide titles array (global)
const slideTitles = [""];

// Global animation state
let isAnimating = false;
let pendingNavigation = null;

// Thumbnail hover state
let currentHoveredThumb = null;
let lastHoveredThumbIndex = null;
let mouseOverThumbnails = false;

// ------------------ Utilities ------------------
// Update navigation arrows and thumbnails
function updateNavigationUI(disabled) {
  document.querySelectorAll(".counter-nav").forEach(btn => {
    btn.style.opacity = disabled ? "0.3" : "";
    btn.style.pointerEvents = disabled ? "none" : "";
  });
  document.querySelectorAll(".slide-thumb").forEach(thumb => {
    thumb.style.pointerEvents = disabled ? "none" : "";
  });
}

// Update slide counter
function updateSlideCounter(index) {
  const el = document.querySelector(".current-slide");
  if (el) el.textContent = String(index + 1).padStart(2, "0");
}

// Update slide title with animation
function updateSlideTitle(index) {
  const container = document.querySelector(".slide-title-container");
  const current = document.querySelector(".slide-title");
  if (!container || !current) return;

  const newTitle = document.createElement("div");
  newTitle.className = "slide-title enter-up";
  newTitle.textContent = slideTitles[index];
  container.appendChild(newTitle);

  current.classList.add("exit-up");
  void newTitle.offsetWidth; // force reflow
  setTimeout(() => newTitle.classList.remove("enter-up"), 10);
  setTimeout(() => current.remove(), 500);
}

// Update drag lines with wave effect
function updateDragLines(activeIndex = null) {
  const lines = document.querySelectorAll(".drag-line");
  if (!lines.length) return;

  const slideCount = document.querySelectorAll(".slide").length;
  const lineCount = lines.length;
  const thumbWidth = 720 / slideCount;

  lines.forEach((line, i) => {
    gsap.to(line, {
      height: "var(--line-base-height)",
      backgroundColor: "rgba(255,255,255,0.3)",
      duration: 0.2,
      overwrite: "auto"
    });
  });

  if (activeIndex === null) return;

  const centerPos = (activeIndex + 0.5) * thumbWidth;
  const lineWidth = 720 / lineCount;
  const maxDistance = thumbWidth * 0.7;

  lines.forEach((line, i) => {
    const linePos = (i + 0.5) * lineWidth;
    const dist = Math.abs(linePos - centerPos);
    if (dist <= maxDistance) {
      const norm = dist / maxDistance;
      const wave = Math.cos((norm * Math.PI) / 2);
      const baseHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue("--line-base-height"));
      const height = baseHeight + wave * 35;
      const opacity = 0.3 + wave * 0.4;

      gsap.to(line, {
        height: `${height}px`,
        backgroundColor: `rgba(255,255,255,${opacity})`,
        duration: 0.3,
        overwrite: "auto",
        delay: norm * 0.1
      });
    }
  });
}

// ------------------ Slideshow Class ------------------
class Slideshow {
  DOM = { el: null, slides: null, slidesInner: null };
  current = 0;
  slidesTotal = 0;

  constructor(el) {
    this.DOM.el = el;
    this.DOM.slides = [...el.querySelectorAll(".slide")];
    this.DOM.slidesInner = this.DOM.slides.map(slide => slide.querySelector(".slide__img"));
    this.DOM.slides[this.current].classList.add("slide--current");
    this.slidesTotal = this.DOM.slides.length;
  }

  next() { this.navigate(NEXT); }
  prev() { this.navigate(PREV); }

  goTo(index) {
    if (isAnimating) {
      pendingNavigation = { type: "goto", index };
      return;
    }
    if (index === this.current) return;
    this.animateSlide(this.current, index, index > this.current ? 1 : -1);
  }

  navigate(direction) {
    if (isAnimating) {
      pendingNavigation = { type: "navigate", direction };
      return;
    }
    const prev = this.current;
    this.current = direction === NEXT
      ? (this.current + 1) % this.slidesTotal
      : (this.current - 1 + this.slidesTotal) % this.slidesTotal;
    this.animateSlide(prev, this.current, direction);
  }

  animateSlide(prevIndex, nextIndex, direction) {
    isAnimating = true;
    updateNavigationUI(true);

    const thumbs = document.querySelectorAll(".slide-thumb");
    thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === nextIndex));

    updateSlideCounter(nextIndex);
    updateSlideTitle(nextIndex);
    updateDragLines(nextIndex);

    const prevSlide = this.DOM.slides[prevIndex];
    const prevInner = this.DOM.slidesInner[prevIndex];
    const nextSlide = this.DOM.slides[nextIndex];
    const nextInner = this.DOM.slidesInner[nextIndex];

    gsap.timeline({
      onStart: () => nextSlide.classList.add("slide--current"),
      onComplete: () => {
        prevSlide.classList.remove("slide--current");
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
          updateDragLines(lastHoveredThumbIndex);
        }
      }
    })
    .addLabel("start", 0)
    .fromTo(nextSlide,
      { autoAlpha: 1, scale: 0.1, yPercent: direction === 1 ? 100 : -100 },
      { duration: 0.7, ease: "expo", scale: 0.4, yPercent: 0 },
      "start"
    )
    .fromTo(nextInner,
      { filter: "contrast(100%) saturate(100%)", transformOrigin: "100% 50%", scaleY: 4 },
      { duration: 0.7, ease: "expo", scaleY: 1 },
      "start"
    )
    .fromTo(prevInner,
      { filter: "contrast(100%) saturate(100%)" },
      { duration: 0.7, ease: "expo", filter: "contrast(120%) saturate(140%)" },
      "start"
    )
    .addLabel("middle", "start+=0.6")
    .to(nextSlide, { duration: 1, ease: "power4.inOut", scale: 1 }, "middle")
    .to(prevSlide, { duration: 1, ease: "power4.inOut", scale: 0.98, autoAlpha: 0 }, "middle");
  }
}

// ------------------ Initialization ------------------
document.addEventListener("DOMContentLoaded", () => {
  const slidesEl = document.querySelector(".slides");
  const slideshow = new Slideshow(slidesEl);

  // Thumbnails
  const thumbsContainer = document.querySelector(".slide-thumbs");
  const slideImgs = document.querySelectorAll(".slide__img");
  const slideCount = slideImgs.length;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";
    slideImgs.forEach((img, index) => {
      const thumb = document.createElement("div");
      thumb.className = "slide-thumb";
      thumb.style.backgroundImage = img.style.backgroundImage;
      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        lastHoveredThumbIndex = index;
        slideshow.goTo(index);
      });

      thumb.addEventListener("mouseenter", () => {
        currentHoveredThumb = index;
        lastHoveredThumbIndex = index;
        mouseOverThumbnails = true;
        if (!isAnimating) updateDragLines(index);
      });

      thumb.addEventListener("mouseleave", () => {
        if (currentHoveredThumb === index) currentHoveredThumb = null;
      });

      thumbsContainer.appendChild(thumb);
    });
  }

  // Drag lines
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

  // Total slides
  document.querySelector(".total-slides")?.textContent = String(slideCount).padStart(2, "0");

  // Navigation buttons
  document.querySelector(".prev-slide")?.addEventListener("click", () => slideshow.prev());
  document.querySelector(".next-slide")?.addEventListener("click", () => slideshow.next());

  updateSlideCounter(0);
  updateDragLines(0);

  // Thumbs hover area
  const thumbsArea = document.querySelector(".thumbs-container");
  thumbsArea?.addEventListener("mouseenter", () => mouseOverThumbnails = true);
  thumbsArea?.addEventListener("mouseleave", () => {
    mouseOverThumbnails = false;
    currentHoveredThumb = null;
    updateDragLines(null);
  });

  // GSAP Observer or fallback
  try {
    const ObserverObj = typeof Observer !== "undefined" ? Observer : gsap.Observer;
    if (ObserverObj) {
      Observer.create({
        target: window,
        type: "wheel,touch",
        onWheel: e => {
          if (!isAnimating) e.deltaY > 0 ? slideshow.next() : slideshow.prev();
        },
        wheelSpeed: -1,
        preventDefault: true,
        tolerance: 10
      });
    }
  } catch {
    let touchStartY = 0;
    document.addEventListener("wheel", e => { if (!isAnimating) e.deltaY > 0 ? slideshow.next() : slideshow.prev(); });
    document.addEventListener("touchstart", e => touchStartY = e.touches[0].clientY);
    document.addEventListener("touchend", e => {
      if (isAnimating) return;
      const diff = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diff) > 50) diff > 0 ? slideshow.prev() : slideshow.next();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", e => {
    if (isAnimating) return;
    if (e.key === "ArrowRight") slideshow.next();
    else if (e.key === "ArrowLeft") slideshow.prev();
  });
});