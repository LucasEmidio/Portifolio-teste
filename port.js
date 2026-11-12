/**
 * PORTFÓLIO ULTRA-INTERATIVO - LUCAS EMÍDIO
 * Funcionalidades: 
 * - Rastro de fumaça cósmica brilhante e bolinha neon no cursor
 * - 3D Tilt contínuo (Lerp) com reflexo espelhado e luz especular
 * - Canvas de partículas no fundo
 * - Digitação dinâmica, Terminal interativo e Filtros
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. RASTRO DE FUMAÇA CÓSMICA BRILHANTE & BOLINHA NEON NO CURSOR
       ========================================================================== */
    const smokeCanvas = document.getElementById('cursor-smoke-canvas');
    const glowDot = document.getElementById('mouseGlowDot');
    
    let smokeCtx = null;
    let smokeWidth = 0;
    let smokeHeight = 0;
    const smokeParticles = [];

    const mousePos = { x: -100, y: -100, lastX: -100, lastY: -100, speed: 0 };
    const dotPos = { x: -100, y: -100 };

    if (smokeCanvas) {
        smokeCtx = smokeCanvas.getContext('2d');
        smokeWidth = smokeCanvas.width = window.innerWidth;
        smokeHeight = smokeCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            smokeWidth = smokeCanvas.width = window.innerWidth;
            smokeHeight = smokeCanvas.height = window.innerHeight;
        });

        class SmokePuff {
            constructor(x, y, speedX, speedY) {
                this.x = x;
                this.y = y;
                this.vx = speedX * 0.25 + (Math.random() - 0.5) * 0.8;
                this.vy = speedY * 0.25 - (Math.random() * 0.6 + 0.3); // Flutua suavemente para cima como fumaça
                this.radius = Math.random() * 6 + 8;
                this.growth = Math.random() * 0.35 + 0.2;
                this.maxRadius = this.radius + 32;
                this.alpha = Math.random() * 0.35 + 0.45;
                this.decay = Math.random() * 0.012 + 0.014;
                
                // Variação de cores: Ciano neon, Roxo cósmico, Rosa elétrico e Branco brilhante
                const colorTypes = [
                    { r: 6, g: 182, b: 212 },   // Ciano
                    { r: 139, g: 92, b: 246 },  // Roxo
                    { r: 59, g: 130, b: 246 },  // Azul
                    { r: 236, g: 72, b: 153 }   // Rosa neon
                ];
                this.color = colorTypes[Math.floor(Math.random() * colorTypes.length)];
                this.sparkle = Math.random() > 0.6; // Pequeno brilho cintilante
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.96; // Atrito do ar
                this.vy *= 0.96;
                this.radius += this.growth;
                this.alpha -= this.decay;
            }

            draw(ctx) {
                if (this.alpha <= 0) return;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                
                const grad = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.9})`);
                grad.addColorStop(0.3, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.7})`);
                grad.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.25})`);
                grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();

                // Partícula cintilante no núcleo
                if (this.sparkle && this.alpha > 0.2) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                    ctx.beginPath();
                    ctx.arc(this.x + (Math.random() - 0.5) * 4, this.y + (Math.random() - 0.5) * 4, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        window.addEventListener('mousemove', (e) => {
            if (mousePos.x === -100) {
                dotPos.x = e.clientX;
                dotPos.y = e.clientY;
            }

            const dx = e.clientX - mousePos.x;
            const dy = e.clientY - mousePos.y;
            mousePos.speed = Math.sqrt(dx * dx + dy * dy);

            mousePos.lastX = mousePos.x;
            mousePos.lastY = mousePos.y;
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;

            if (glowDot) {
                glowDot.style.opacity = '1';
            }

            // Gera fumaça ao mover o mouse
            const spawnCount = Math.min(Math.floor(mousePos.speed / 4) + 1, 4);
            for (let i = 0; i < spawnCount; i++) {
                // Interpola entre a última posição e a atual para não dar falhas em movimentos rápidos
                const t = Math.random();
                const spawnX = mousePos.lastX + (mousePos.x - mousePos.lastX) * t;
                const spawnY = mousePos.lastY + (mousePos.y - mousePos.lastY) * t;
                smokeParticles.push(new SmokePuff(spawnX, spawnY, dx, dy));
            }
        });

        window.addEventListener('mouseleave', () => {
            if (glowDot) glowDot.style.opacity = '0';
        });

        // Loop de Renderização da Fumaça e Bolinha Neon
        function renderSmoke() {
            smokeCtx.clearRect(0, 0, smokeWidth, smokeHeight);

            // Suavização elástica da bolinha brilhante (Lerp)
            dotPos.x += (mousePos.x - dotPos.x) * 0.22;
            dotPos.y += (mousePos.y - dotPos.y) * 0.22;

            if (glowDot && mousePos.x !== -100) {
                glowDot.style.left = `${dotPos.x}px`;
                glowDot.style.top = `${dotPos.y}px`;
            }

            // Atualizar e desenhar partículas de fumaça
            for (let i = smokeParticles.length - 1; i >= 0; i--) {
                const p = smokeParticles[i];
                p.update();
                p.draw(smokeCtx);
                if (p.alpha <= 0) {
                    smokeParticles.splice(i, 1);
                }
            }

            requestAnimationFrame(renderSmoke);
        }

        renderSmoke();
    }

    /* ==========================================================================
       2. CANVAS DE PARTÍCULAS INTERATIVAS NO FUNDO (Constelação)
       ========================================================================== */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const totalParticles = Math.min(Math.floor(width / 25), 60);
        const particles = [];
        const mouseRadius = 140;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.7;
                this.speedY = (Math.random() - 0.5) * 0.7;
                this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246, ' : 'rgba(6, 182, 212, ';
                this.opacity = Math.random() * 0.4 + 0.15;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                if (mousePos.x > 0 && mousePos.y > 0) {
                    const dx = mousePos.x - this.x;
                    const dy = mousePos.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseRadius) {
                        const force = (mouseRadius - distance) / mouseRadius;
                        const directionX = (dx / distance) * force * 1.8;
                        const directionY = (dy / distance) * force * 1.8;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.fill();
            }
        }

        for (let i = 0; i < totalParticles; i++) {
            particles.push(new Particle());
        }

        function animateBgParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const lineOpacity = (1 - dist / 110) * 0.2;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
                particles[a].update();
                particles[a].draw();
            }

            requestAnimationFrame(animateBgParticles);
        }

        animateBgParticles();
    }

    /* ==========================================================================
       3. SPOTLIGHT DO CURSOR (Luz Radial)
       ========================================================================== */
    const spotlight = document.getElementById('spotlight');
    if (spotlight) {
        window.addEventListener('mousemove', (e) => {
            spotlight.style.left = `${e.clientX}px`;
            spotlight.style.top = `${e.clientY}px`;
        });
    }

    /* ==========================================================================
       4. IMAGEM DO HERO COM 3D PARALLAX ULTRA-SUAVE (LERP) E ESPELHAMENTO
       ========================================================================== */
    const stage = document.getElementById('heroStage');
    const characterWrapper = document.getElementById('characterWrapper');
    const characterGlow = document.getElementById('characterGlow');
    const characterGlare = document.getElementById('characterGlare');
    const characterShadow = document.getElementById('characterShadow');
    const characterReflection = document.getElementById('characterReflection');
    const floatingBadges = document.querySelectorAll('.floating-badge');

    if (stage && characterWrapper) {
        let bounds = stage.getBoundingClientRect();
        window.addEventListener('resize', () => {
            bounds = stage.getBoundingClientRect();
        });

        // Valores alvo e valores interpolados (Lerp para física 3D super fluida)
        let targetRotX = 0;
        let targetRotY = 0;
        let targetTransX = 0;
        let targetTransY = 0;

        let currentRotX = 0;
        let currentRotY = 0;
        let currentTransX = 0;
        let currentTransY = 0;

        window.addEventListener('mousemove', (e) => {
            bounds = stage.getBoundingClientRect();
            const mouseX = e.clientX - (bounds.left + bounds.width / 2);
            const mouseY = e.clientY - (bounds.top + bounds.height / 2);

            // Amplitude e inclinação tridimensional
            targetRotX = (-mouseY / (bounds.height / 2)) * 18;
            targetRotY = (mouseX / (bounds.width / 2)) * 20;

            targetTransX = (mouseX / (bounds.width / 2)) * 18;
            targetTransY = (mouseY / (bounds.height / 2)) * 14;

            // Brilho especular dinâmico na foto
            if (characterGlare) {
                const glareX = Math.max(0, Math.min(100, ((e.clientX - bounds.left) / bounds.width) * 100));
                const glareY = Math.max(0, Math.min(100, ((e.clientY - bounds.top) / bounds.height) * 100));
                characterGlare.style.opacity = '1';
                characterGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 65%)`;
            }
        });

        window.addEventListener('mouseleave', () => {
            targetRotX = 0;
            targetRotY = 0;
            targetTransX = 0;
            targetTransY = 0;
            if (characterGlare) characterGlare.style.opacity = '0';
        });

        // Loop de Animação 3D contínua a 60 FPS
        function animateCharacter3D() {
            // Interpolação suave (Lerp)
            currentRotX += (targetRotX - currentRotX) * 0.08;
            currentRotY += (targetRotY - currentRotY) * 0.08;
            currentTransX += (targetTransX - currentTransX) * 0.08;
            currentTransY += (targetTransY - currentTransY) * 0.08;

            // Rotação tridimensional no personagem
            characterWrapper.style.transform = `
                translate3d(${currentTransX}px, ${currentTransY}px, 0)
                rotateX(${currentRotX}deg)
                rotateY(${currentRotY}deg)
            `;

            // Reflexo espelhado sincronizado em 3D
            if (characterReflection) {
                characterReflection.style.transform = `
                    scaleY(-1)
                    rotateX(${-currentRotX * 0.6}deg)
                    rotateY(${currentRotY * 0.6}deg)
                `;
            }

            // Sombra 3D projetada reativa à luz oposta
            if (characterShadow) {
                characterShadow.style.transform = `
                    translate3d(${-currentTransX * 0.8}px, 0, 0)
                    scaleX(${1 + Math.abs(currentRotY) * 0.015})
                `;
            }

            // Glow com profundidade 3D
            if (characterGlow) {
                characterGlow.style.transform = `
                    translate(calc(-50% + ${currentTransX * 1.6}px), calc(-50% + ${currentTransY * 1.6}px))
                `;
            }

            // Badges flutuantes com parallax
            floatingBadges.forEach(badge => {
                const speed = parseFloat(badge.getAttribute('data-speed')) || 1;
                badge.style.transform = `
                    translate3d(${currentTransX * speed * 0.9}px, ${currentTransY * speed * 0.9}px, 35px)
                `;
            });

            requestAnimationFrame(animateCharacter3D);
        }

        animateCharacter3D();
    }

    /* ==========================================================================
       5. EFEITO DE DIGITAÇÃO AUTOMÁTICA (Typewriter Dinâmico)
       ========================================================================== */
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const phrases = [
            'Desenvolvedor Front-End',
            'Criador de Interfaces Vivas',
            'Especialista em JavaScript & CSS3',
            'Apaixonado por UI / UX'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 90;

        function type() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 45;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 90;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 1600;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400;
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    /* ==========================================================================
       6. TERMINAL IDE INTERATIVO (Abas no Sobre Mim)
       ========================================================================== */
    const terminalTabs = document.querySelectorAll('.terminal-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    terminalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            terminalTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    /* ==========================================================================
       7. FILTROS DA VITRINE DE PROJETOS
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filtro-btn');
    const projectItems = document.querySelectorAll('.showcase-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                const category = item.getAttribute('data-categoria');
                if (filterValue === 'todos' || category === filterValue) {
                    item.style.display = '';
                    item.style.animation = 'fadeIn 0.4s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    /* ==========================================================================
       8. BOTÃO COPIAR E-MAIL COM FEEDBACK VISUAL INSTANTÂNEO
       ========================================================================== */
    const btnCopyEmail = document.getElementById('btn-copy-email');
    if (btnCopyEmail) {
        btnCopyEmail.addEventListener('click', () => {
            const email = 'lucasemidioyt@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const statusSpan = btnCopyEmail.querySelector('.copy-status');
                const icon = btnCopyEmail.querySelector('i');
                const originalText = statusSpan.textContent;

                statusSpan.textContent = 'Copiado! ✓';
                btnCopyEmail.style.background = '#10b981';
                if (icon) icon.className = 'fa-solid fa-check';

                setTimeout(() => {
                    statusSpan.textContent = originalText;
                    btnCopyEmail.style.background = '';
                    if (icon) icon.className = 'fa-regular fa-copy';
                }, 2200);
            });
        });
    }

    /* ==========================================================================
       9. MENU MOBILE
       ========================================================================== */
    const btnMobile = document.getElementById('btn-mobile');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (btnMobile && navMenu) {
        btnMobile.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            const icon = btnMobile.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = btnMobile.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });
    }

    /* ==========================================================================
       10. MODAL SOBRE MIM
       ========================================================================== */
    const modal = document.getElementById('modal-sobre');
    const btnAbrirModal = document.getElementById('btn-sobre-modal');
    const btnFecharModal = document.getElementById('fechar-modal');

    window.abrirModal = function() {
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };

    window.fecharModal = function() {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    if (btnAbrirModal) btnAbrirModal.addEventListener('click', window.abrirModal);
    if (btnFecharModal) btnFecharModal.addEventListener('click', window.fecharModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.fecharModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                window.fecharModal();
            }
        });
    }

    /* ==========================================================================
       11. ALTERNADOR DE TEMA DARK / LIGHT COM LOCALSTORAGE
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('lucas-portfolio-theme');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        atualizarIconeTema(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('lucas-portfolio-theme', isLight ? 'light' : 'dark');
            atualizarIconeTema(isLight);
        });
    }

    function atualizarIconeTema(isLight) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = isLight ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
        }
    }

    /* ==========================================================================
       12. SCROLL SPY (Destacar seção ativa no menu)
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const linkCorrespondente = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (linkCorrespondente) linkCorrespondente.classList.add('active');
            }
        });
    });

});
