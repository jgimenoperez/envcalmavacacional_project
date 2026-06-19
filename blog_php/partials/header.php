<header class="header">
    <div class="header-content">
        <div class="logo-section">
            <a href="<?= e(BLOG_BASE) ?>/" class="logo-mark">
                <span class="logo-word">enCalma</span>
                <span class="logo-sub">Vacacional · Blog</span>
            </a>
        </div>
        <button class="nav-toggle" aria-label="Menú">
            <span></span><span></span><span></span>
        </button>
        <nav class="nav-section" id="mainNav">
            <a href="<?= e(SITE_URL) ?>/" class="nav-link">Inicio</a>
            <div class="nav-dropdown">
                <a href="<?= e(SITE_URL) ?>/" class="nav-link nav-dropdown-toggle">Apartamentos <span class="nav-arrow">&#9662;</span></a>
                <div class="nav-dropdown-menu">
                    <a href="<?= e(SITE_URL) ?>/apartamento-vacacional-ciudamar/">Apartamento Vacacional La Playa</a>
                    <a href="<?= e(SITE_URL) ?>/apartamento-vacacional-atico/">Apartamento Vacacional El Ático</a>
                </div>
            </div>
            <a href="<?= e(SITE_URL) ?>/somos-encalma/" class="nav-link">Anfitriones</a>
            <a href="<?= e(SITE_URL) ?>/contact/" class="nav-link">Contacto</a>
            <a href="<?= e(SITE_URL) ?>/#faqs_home" class="nav-link">Faqs</a>
            <a href="<?= e(BLOG_BASE) ?>/" class="nav-link">Blog</a>
            <a href="<?= e(SITE_URL) ?>/actualidad-de-sagunto/" class="nav-link nav-active">Actualidad de Sagunto</a>
        </nav>
    </div>
</header>
