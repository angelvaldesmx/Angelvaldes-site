document.addEventListener("DOMContentLoaded", () => {
    
    const body = document.body;
    const startButton = document.getElementById("startButton");
    const cursorCanvas = document.getElementById("cursorCanvas");
    const blackCanvas = document.getElementById("blackCanvas");
    const blackholeContainer = document.getElementById("blackhole-overlay");

    // ================================
    // 1. LÓGICA DEL BLACK HOLE (OPTIMIZADA PARA MÓVIL)
    // ================================
    
    if (blackCanvas && blackholeContainer) {

        const h = blackholeContainer.offsetHeight;
        const w = blackholeContainer.offsetWidth;
        const cw = w;
        const ch = h;
        const maxorbit = 255; 
        const centery = ch / 2;
        const centerx = cw / 2;

        const startTime = new Date().getTime();
        let currentTime = 0;

        const stars = [];
        let collapse = false;
        let expanse = false;
        let returning = false;

        const context = blackCanvas.getContext("2d");
        blackCanvas.width = cw;
        blackCanvas.height = ch;

        function rotate(cx, cy, x, y, angle) {
            const radians = angle;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
            const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return [nx, ny];
        }

        const Star = function() {
            let x, y, orbit, rad, speed, spin, color;
            
            const randomopacity = Math.random();
            if (randomopacity < .2) {
                this.opacity = .1;
            } else if (randomopacity > .2 && randomopacity < .8) {
                this.opacity = Math.random() * .4 + .3;
            } else {
                this.opacity = 1;
            }

            this.orbit = (Math.random() * maxorbit) + (maxorbit / 3);
            this.rad = (Math.random() * 180);
            this.speed = (Math.random() * .5) + .1;
            this.spin = (Math.random() * 2) + .1;
            this.color = '255,255,255'; 

            this.draw = function() {
                let x, y, x_relative, y_relative;
                
                if (collapse === true) {
                    if (this.opacity < .1) { this.opacity = .1; }
                    if (this.orbit > 0) {
                        this.orbit -= 2;
                    } else {
                        this.orbit = 0;
                    }
                } else if (expanse === true) {
                    this.spin += .1;
                    if (this.opacity < .1) { this.opacity = .1; }
                    this.orbit += (3 * this.speed);
                } else if (returning === false) {
                    if (this.orbit < (maxorbit + (maxorbit / 3))) {
                        this.orbit += .5;
                    }
                } else {
                    if (this.orbit > this.rad) {
                        this.orbit -= 1;
                    } else {
                        this.orbit = this.rad;
                        this.opacity = Math.random() * .4 + .3;
                    }
                }
                
                x_relative = this.orbit;
                y_relative = 0;
                
                const newpos = rotate(0, 0, x_relative, y_relative, this.rad + currentTime * this.speed);
                x = newpos[0] + centerx;
                y = newpos[1] + centery;
                
                context.beginPath();
                context.fillStyle = 'rgba(' + this.color + ',' + this.opacity + ')';
                context.arc(x, y, (this.orbit / maxorbit) * 2, 0, 2 * Math.PI, false);
                context.fill();
            }
            
            stars.push(this);
        }

        if (startButton) {
            startButton.addEventListener('click', function() {
                if (expanse === false) {
                    expanse = true;
                    // FIX: Pausar animación al salir para ahorrar CPU
                    setTimeout(() => { cancelAnimationFrame(animationFrameId); }, 2000);
                    body.classList.remove("intro-active");
                }
            });
            
            startButton.addEventListener('mouseover', function() {
                if (expanse === false) { collapse = true; }
            });
            
            startButton.addEventListener('mouseout', function() {
                if (expanse === false) { collapse = false; }
            });
        }

        let animationFrameId;

        function loop() {
            const now = new Date().getTime();
            currentTime = (now - startTime) / 50;

            context.fillStyle = 'rgba(0,0,0,0.2)'; 
            context.fillRect(0, 0, cw, ch);

            for (let i = 0; i < stars.length; i++) {
                if (stars[i] !== undefined) {
                    stars[i].draw();
                }
            }

            animationFrameId = requestAnimationFrame(loop);
        }

        function initBlackHole() {
            context.fillStyle = 'rgba(0,0,0,1)'; 
            context.fillRect(0, 0, cw, ch);
            
            // 🔥 OPTIMIZACIÓN MÓVIL 🔥
            // Si es pantalla chica (< 768px), usamos 600 estrellas. Si no, 2500.
            const isMobile = window.innerWidth < 768;
            const starCount = isMobile ? 600 : 2500;

            for (let i = 0; i < starCount; i++) {
                new Star();
            }
            loop();
        }
        
        initBlackHole();
    } 

    // ================================
    // 2. LÓGICA DEL CURSOR NEON (DESACTIVADO EN MÓVIL)
    // ================================
    // En móvil no hay "mouse", así que esto gasta batería a lo tonto. Lo quitamos.
    if (cursorCanvas && window.matchMedia("(pointer: fine)").matches) {
      const ctx = cursorCanvas.getContext("2d");

      function resizeCanvas() {
        cursorCanvas.width = window.innerWidth;
        cursorCanvas.height = document.documentElement.scrollHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      let mouseX = 0, mouseY = 0;
      let particles = [];

      function random(min, max) {
        return Math.random() * (max - min) + min;
      }

      function createParticle(x, y) {
        particles.push({
          x,
          y,
          size: random(4, 8),
          alpha: 1,
          fade: random(0.02, 0.05),
          vx: random(-1, 1),
          vy: random(-1, 1)
        });
      }

      function drawParticles() {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

        particles.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.fade;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        });

        requestAnimationFrame(drawParticles);
      }

      drawParticles();

      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY + window.scrollY;
        createParticle(mouseX, mouseY);
      });
    }

});
