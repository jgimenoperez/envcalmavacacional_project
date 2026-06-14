// Navegación: hamburger y dropdown
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('mainNav');
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    // Hamburger toggle
    toggle.addEventListener('click', function() {
        const isOpen = nav.classList.contains('nav-open');

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    function openMenu() {
        nav.classList.add('nav-open');
        toggle.classList.add('active');

        // Crear overlay
        const overlay = document.createElement('div');
        overlay.classList.add('nav-overlay');
        overlay.addEventListener('click', closeMenu);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        nav.classList.remove('nav-open');
        toggle.classList.remove('active');

        const overlay = document.querySelector('.nav-overlay');
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
    }

    // Dropdown en móvil (clic) y desktop (hover ya en CSS)
    dropdowns.forEach(function(dropdown) {
        var toggleLink = dropdown.querySelector('.nav-dropdown-toggle');

        toggleLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                dropdown.classList.toggle('dropdown-open');
            }
        });
    });

    // Cerrar menú al cambiar tamaño de ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            closeMenu();
            dropdowns.forEach(function(d) { d.classList.remove('dropdown-open'); });
        }
    });
});
