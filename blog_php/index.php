<?php
/**
 * Índice del blog — renderizado server-side desde Prismic.
 * El HTML sale completo (tarjetas + categorías) → indexable y compartible.
 */
require_once __DIR__ . '/lib/prismic.php';
require_once __DIR__ . '/lib/render.php';

$articles = prismic_all_articles();

// Categorías con conteo (lo que hacía getCategories en main.js)
$categories = [];
foreach ($articles as $a) {
    $cat = $a['category'];
    $categories[$cat] = ($categories[$cat] ?? 0) + 1;
}

// Meta
$pageTitle = 'Actualidad de Sagunto · enCalma Vacacional';
$pageDesc  = 'Guía de Sagunto: todo lo que ver, comer y vivir. Playas, patrimonio, gastronomía y consejos para tu estancia en la Costa de Valencia.';
$canonical = BLOG_URL . '/';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($pageDesc) ?>">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="<?= e($canonical) ?>">
    <meta property="og:title" content="<?= e($pageTitle) ?>">
    <meta property="og:description" content="<?= e($pageDesc) ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?= e($canonical) ?>">
    <meta property="og:image" content="<?= e(OG_FALLBACK_IMAGE) ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($pageTitle) ?>">
    <meta name="twitter:description" content="<?= e($pageDesc) ?>">
    <meta name="twitter:image" content="<?= e(OG_FALLBACK_IMAGE) ?>">
    <link rel="icon" type="image/png" href="<?= e(SITE_URL) ?>/wp-content/uploads/2025/09/favicon-300x300.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Dancing+Script:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(BLOG_BASE) ?>/css/styles.css">
</head>
<body>
    <?php include __DIR__ . '/partials/header.php'; ?>

    <section class="hero-band">
        <div class="hero-band-inner">
            <div class="hero-band-text">
                <span class="eyebrow">Guía de Sagunto</span>
                <h1 class="hero-band-title">Todo lo que ver, comer y vivir en Sagunto</h1>
            </div>
            <label class="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
                <input type="search" id="searchInput" placeholder="Buscar artículos…" aria-label="Buscar artículos">
            </label>
        </div>
    </section>

    <main class="guide-layout">
        <aside class="guide-sidebar">
            <div class="sidebar-block">
                <h2 class="sidebar-title">Categorías</h2>
                <div class="cat-list" id="categoriesGrid">
                    <button class="cat-item cat-active" data-category="all">
                        <span class="cat-name">Todo</span>
                        <span class="cat-count"><?= count($articles) ?></span>
                    </button>
                    <?php foreach ($categories as $name => $count): ?>
                    <button class="cat-item" data-category="<?= e($name) ?>">
                        <span class="cat-name"><?= e($name) ?></span>
                        <span class="cat-count"><?= (int)$count ?></span>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="host-card">
                <div class="host-card-head">
                    <img class="host-card-logo" src="https://images.prismic.io/encalmavacacionalblog/abk2Ibbci2UF6G39_logo_encalma-1-.webp?auto=format,compress&h=44&dpr=2" alt="enCalma" width="88" height="44" loading="lazy">
                </div>
                <p class="host-card-name">Gloria &amp; Álvaro</p>
                <p class="host-card-text">Más que anfitriones, vuestros compañeros de viaje en Puerto de Sagunto.</p>
                <a href="<?= e(SITE_URL) ?>/somos-encalma/" class="cta-link">Sobre los anfitriones →</a>
            </div>
        </aside>

        <section class="guide-list">
            <div class="guide-list-head">
                <span class="eyebrow">Últimas historias</span>
                <h2 class="guide-list-title">Actualidad de Sagunto</h2>
            </div>
            <div class="post-list" id="articlesContainer">
                <?php if (empty($articles)): ?>
                    <p class="empty-state">No hay artículos disponibles por ahora.</p>
                <?php else: foreach ($articles as $a):
                    $img = $a['image'] ? img_optimize($a['image'], 'w=480&h=360&fit=crop') : '';
                    $url = BLOG_BASE . '/articulo/' . rawurlencode($a['slug']);
                    $readTime = estimate_read_time($a['content']);
                ?>
                <article class="post-card" data-category="<?= e($a['category']) ?>" data-title="<?= e(mb_strtolower($a['title'])) ?>">
                    <a class="post-card-media" href="<?= e($url) ?>">
                        <?php if ($img): ?>
                            <img src="<?= e($img) ?>" alt="<?= e($a['title']) ?>" width="240" height="180" loading="lazy">
                        <?php else: ?>
                            <span class="post-card-media-empty"></span>
                        <?php endif; ?>
                    </a>
                    <div class="post-card-body">
                        <span class="pill pill-ghost"><?= e($a['category']) ?></span>
                        <h3 class="post-card-title"><a href="<?= e($url) ?>"><?= e($a['title']) ?></a></h3>
                        <p class="post-card-excerpt"><?= e($a['excerpt']) ?></p>
                        <div class="post-card-meta"><?= e(format_date_es($a['date_raw'])) ?> · Por <?= e($a['author']) ?> · <?= $readTime ?> min de lectura</div>
                    </div>
                </article>
                <?php endforeach; endif; ?>
            </div>
        </section>
    </main>

    <?php include __DIR__ . '/partials/footer.php'; ?>

    <script type="application/ld+json">
    <?= json_encode([
        '@context' => 'https://schema.org',
        '@type'    => 'Blog',
        'name'     => 'enCalma Vacacional · Blog',
        'url'      => $canonical,
        'description' => $pageDesc,
        'publisher' => [
            '@type' => 'Organization',
            'name'  => 'enCalma Vacacional',
            'url'   => SITE_URL . '/',
            'logo'  => ['@type' => 'ImageObject', 'url' => SITE_URL . '/logo.png'],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
    </script>

    <script src="<?= e(BLOG_BASE) ?>/nav.js"></script>
    <script src="<?= e(BLOG_BASE) ?>/filter.js"></script>
</body>
</html>
