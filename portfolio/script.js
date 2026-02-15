document.addEventListener('DOMContentLoaded', () => {
    // --- Page Transition ---
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 50);

    // --- Theme Switcher ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check local storage for theme
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-theme');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';

            // Re-init canvas to pick up new colors
            initCanvas();
        });
    }

    // --- Nav Interaction (if exists) ---
    const navItems = document.querySelectorAll('.glass-nav li');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }


    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
});

// --- Dynamic Network Background Animation ---
const canvas = document.getElementById('canvas-bg');
// Only run canvas logic if canvas exists
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray;

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particlesArray = [];

        const isLight = document.body.classList.contains('light-theme');
        const numberOfParticles = (canvas.height * canvas.width) / 9000;

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = isLight ? 'rgba(0, 123, 255, 0.8)' : 'rgba(100, 255, 218, 0.8)'; // Blue or Cyan

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    function connect() {
        const isLight = document.body.classList.contains('light-theme');
        let opacityValue = 1;
        let maxDistance = 140;

        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                if (distance < (maxDistance * maxDistance)) {
                    opacityValue = 1 - (distance / 20000);

                    if (isLight) {
                        ctx.strokeStyle = 'rgba(0, 123, 255,' + opacityValue + ')';
                    } else {
                        ctx.strokeStyle = 'rgba(100, 255, 218,' + opacityValue + ')';
                    }

                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', initCanvas);

    // Init on load
    initCanvas();
    animate();
}
