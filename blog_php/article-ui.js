// Mejora progresiva del artículo: TOC scrollspy + copiar enlace.
// El índice (TOC) ya viene renderizado por PHP; esto resalta el activo al hacer scroll.
document.addEventListener('DOMContentLoaded', function () {
    const links = Array.from(document.querySelectorAll('.toc-link'));
    if (links.length) {
        const targets = links
            .map(l => document.getElementById(l.dataset.target))
            .filter(Boolean);

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(l => l.classList.toggle('toc-active', l.dataset.target === entry.target.id));
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

        targets.forEach(t => observer.observe(t));
    }

    // Copiar enlace al portapapeles
    const copy = document.getElementById('shareCopy');
    if (copy) {
        copy.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.clipboard?.writeText(this.href);
            this.classList.add('copied');
            setTimeout(() => this.classList.remove('copied'), 1500);
        });
    }
});
