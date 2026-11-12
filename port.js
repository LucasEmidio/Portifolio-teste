/**
 * PORTFÓLIO ULTRA-INTERATIVO - LUCAS EMÍDIO
 * Funcionalidades: 3D Mouse Tilt na Imagem, Canvas de Partículas,
 * Digitação Automática, Terminal Interativo, Filtros e Micro-interações.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. CANVAS DE PARTÍCULAS INTERATIVAS (Fundo Constelação Dinâmica)
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

        // Configuração das partículas
        const totalParticles = Math.min(Math.floor(width / 25), 65);
        const particles = [];
        const mouse = { x: null, y: null, radius: 140 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
                this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246, ' : 'rgba(6, 182, 212, ';
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Rebater nas bordas
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                // Interação suave com o mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = (dx / distance) * force * 2;
                        const directionY = (dy / distance) * force * 2;
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

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);

            // Conectar partículas próximas com linhas
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const lineOpacity = (1 - dist / 110) * 0.25;
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

            requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }

    /* ==========================================================================
       2. SPOTLIGHT DO CURSOR (Luz Dinâmica)
       ========================================================================== */
    const spotlight = document.getElementById('spotlight');
    if (spotlight) {
        window.addEventListener('mousemove', (e) => {
            spotlight.style.left = `${e.clientX}px`;
            spotlight.style.top = `${e.clientY}px`;
        });
    }

    /* ==========================================================================
       3. IMAGEM 3D TILT GUIADA PELO MOUSE & PARALLAX DE CAMADAS
       ========================================================================== */
    const stage = document.getElementById('heroStage');
    const characterWrapper = document.getElementById('characterWrapper');
    const characterGlow = document.getElementById('characterGlow');
    const floatingBadges = document.querySelectorAll('.floating-badge');

    if (stage && characterWrapper) {
        let bounds = stage.getBoundingClientRect();
        
        window.addEventListener('resize', () => {
            bounds = stage.getBoundingClientRect();
        });

        // Ouvir mousemove na janela para suavidade máxima
        window.addEventListener('mousemove', (e) => {
            bounds = stage.getBoundingClientRect();
            const mouseX = e.clientX - (bounds.left + bounds.width / 2);
            const mouseY = e.clientY - (bounds.top + bounds.height / 2);

            // Intensidade da rotação (máximo de 16 graus)
            const rotateX = (-mouseY / (bounds.height / 2)) * 14;
            const rotateY = (mouseX / (bounds.width / 2)) * 16;

            // Translação suave
            const transX = (mouseX / (bounds.width / 2)) * 15;
            const transY = (mouseY / (bounds.height / 2)) * 12;

            characterWrapper.style.transform = `
                translate3d(${transX}px, ${transY}px, 0)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;

            // Mover o glow com profundidade diferente
            if (characterGlow) {
                characterGlow.style.transform = `
                    translate(calc(-50% + ${transX * 1.5}px), calc(-50% + ${transY * 1.5}px))
                `;
            }

            // Parallax das badges flutuantes
            floatingBadges.forEach(badge => {
                const speed = parseFloat(badge.getAttribute('data-speed')) || 1;
                badge.style.transform = `
                    translate3d(${transX * speed * 0.8}px, ${transY * speed * 0.8}px, 30px)
                `;
            });
        });

        // Retornar suavemente ao centro quando o mouse sai da tela
        window.addEventListener('mouseleave', () => {
            characterWrapper.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
            if (characterGlow) {
                characterGlow.style.transform = 'translate(-50%, -50%)';
            }
            floatingBadges.forEach(badge => {
                badge.style.transform = 'translate3d(0, 0, 0)';
            });
        });
    }

    /* ==========================================================================
       4. EFEITO DE DIGITAÇÃO AUTOMÁTICA (Typewriter Dinâmico)
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
                typingSpeed = 1600; // Pausa após digitar a frase inteira
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400; // Pausa antes da próxima frase
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    /* ==========================================================================
       5. TERMINAL IDE INTERATIVO (Abas no Sobre Mim)
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
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       6. FILTROS DA VITRINE DE PROJETOS
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
       7. BOTÃO COPIAR E-MAIL COM FEEDBACK VISUAL INSTANTÂNEO
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
       8. MENU MOBILE
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
       9. MODAL SOBRE MIM
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
       10. ALTERNADOR DE TEMA DARK / LIGHT COM LOCALSTORAGE
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
       11. SCROLL SPY (Destacar seção ativa no menu)
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
