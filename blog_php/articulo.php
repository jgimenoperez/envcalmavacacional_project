<?php
/**
 * Detalle de artículo — SSR desde Prismic.
 * Resuelve los puntos críticos del SEO-AUDIT: meta por artículo, OG/Twitter,
 * JSON-LD Article + BreadcrumbList, canonical y 404 reales.
 */
require_once __DIR__ . '/lib/prismic.php';
require_once __DIR__ . '/lib/render.php';

// El slug llega por la reescritura de .htaccess (?slug=) o como query directa.
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

$article = $slug !== '' ? prismic_article_by_slug($slug) : null;

// --- 404 real (no soft 404) ---
if (!$article) {
    http_response_code(404);
    $pageTitle = 'Artículo no encontrado · enCalma Vacacional';
    ?>
    <!DOCTYPE html>
    <html lang="es"><head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?= e($pageTitle) ?></title>
        <meta name="robots" content="noindex, follow">
        <link rel="stylesheet" href="<?= e(BLOG_BASE) ?>/css/styles.css">
    </head><body>
        <?php include __DIR__ . '/partials/header.php'; ?>
        <main class="guide-layout" style="display:block;text-align:center;padding:5rem 1rem;">
            <h1>Artículo no encontrado</h1>
            <p>El artículo que buscas no existe o se ha movido.</p>
            <p><a href="<?= e(BLOG_BASE) ?>/" class="cta-link">← Volver a la guía</a></p>
        </main>
        <?php include __DIR__ . '/partials/footer.php'; ?>
    </body></html>
    <?php
    exit;
}

// --- Render del contenido + TOC ---
$headings = [];
$bodyHtml = parse_prismic_content($article['content'], $headings);
$readTime = estimate_read_time($article['content']);
$dateText = format_date_es($article['date_raw']);

$canonical = BLOG_URL . '/articulo/' . rawurlencode($article['slug']);
$ogImage   = $article['image'] ? img_optimize($article['image'], 'w=1200&h=630&fit=crop') : OG_FALLBACK_IMAGE;
$heroImage = $article['image'] ? img_optimize($article['image'], 'w=1200&h=520&fit=crop') : '';
$desc      = $article['excerpt'] !== '' ? $article['excerpt'] : ('Artículo de la guía de Sagunto de enCalma Vacacional.');

// Artículos relacionados (excluye el actual)
$related = array_values(array_filter(prismic_all_articles(), function ($a) use ($article) {
    return $a['slug'] !== $article['slug'];
}));
$related = array_slice($related, 0, 3);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($article['title']) ?> · enCalma Vacacional</title>
    <meta name="description" content="<?= e($desc) ?>">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="<?= e($canonical) ?>">
    <meta property="og:title" content="<?= e($article['title']) ?>">
    <meta property="og:description" content="<?= e($desc) ?>">
    <meta property="og:type" content="article">
    <meta property="og:url" content="<?= e($canonical) ?>">
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <meta property="article:published_time" content="<?= e($article['date_raw']) ?>">
    <meta property="article:section" content="<?= e($article['category']) ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($article['title']) ?>">
    <meta name="twitter:description" content="<?= e($desc) ?>">
    <meta name="twitter:image" content="<?= e($ogImage) ?>">
    <link rel="icon" type="image/png" href="<?= e(SITE_URL) ?>/wp-content/uploads/2025/09/favicon-300x300.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Dancing+Script:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(BLOG_BASE) ?>/css/styles.css">
    <link rel="stylesheet" href="<?= e(BLOG_BASE) ?>/css/article.css">
</head>
<body>
    <?php include __DIR__ . '/partials/header.php'; ?>

    <nav class="breadcrumb" aria-label="Migas de pan">
        <a href="<?= e(BLOG_BASE) ?>/">Blog</a>
        <span class="breadcrumb-sep">·</span>
        <span><?= e($article['category']) ?></span>
        <span class="breadcrumb-sep">·</span>
        <span class="breadcrumb-current"><?= e($article['title']) ?></span>
    </nav>

    <header class="article-head">
        <span class="pill pill-ghost"><?= e(mb_strtoupper($article['category'])) ?></span>
        <h1 class="article-title"><?= e($article['title']) ?></h1>
        <div class="article-info">
            <span><?= e($dateText) ?></span>
            <span class="separator">·</span>
            <span>Por <?= e($article['author']) ?></span>
            <span class="separator">·</span>
            <span><?= $readTime ?> min de lectura</span>
        </div>
    </header>

    <?php if ($heroImage): ?>
    <section class="article-cover">
        <img class="article-hero-image" src="<?= e($heroImage) ?>" alt="<?= e($article['title']) ?>" width="1200" height="520">
    </section>
    <?php endif; ?>

    <main class="article-layout">
        <aside class="article-toc" id="articleToc" <?= empty($headings) ? 'style="display:none"' : '' ?>>
            <div class="toc-sticky">
                <h2 class="toc-title">En este artículo</h2>
                <nav class="toc-list" id="tocList" aria-label="Índice del artículo">
                    <?php foreach ($headings as $i => $h): ?>
                    <a href="#<?= e($h['id']) ?>" class="toc-link <?= $i === 0 ? 'toc-active' : '' ?>" data-target="<?= e($h['id']) ?>"><?= e($h['text']) ?></a>
                    <?php endforeach; ?>
                </nav>
                <div class="share-row">
                    <a class="share-btn" href="https://api.whatsapp.com/send/?phone=34618874229&amp;text=Encalma+Vacacional.%0D%0A%C2%BFEn+que+te+podemos+ayudar%3F&amp;type=phone_number&amp;app_absent=0" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp" title="WhatsApp">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c2.1.7 2.1.5 2.5.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>
                    </a>
                    <a class="share-btn" href="mailto:apartamentos@encalmavacacional.com?subject=<?= rawurlencode($article['title']) ?>&body=<?= rawurlencode($canonical) ?>" aria-label="Enviar email" title="Email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                    </a>
                    <a class="share-btn" id="shareCopy" href="<?= e($canonical) ?>" aria-label="Copiar enlace" title="Copiar enlace">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
                    </a>
                </div>
            </div>
        </aside>

        <article class="article-wrapper">
            <section class="article-body" id="articleBody">
                <?= $bodyHtml ?: '<p>No hay contenido disponible.</p>' ?>
            </section>
            <a href="<?= e(BLOG_BASE) ?>/" class="article-back-link">← Volver a la guía</a>
        </article>
    </main>

    <?php if (!empty($related)): ?>
    <section class="related-section">
        <div class="related-head">
            <span class="eyebrow">Sigue explorando</span>
            <h2 class="related-title">Artículos relacionados</h2>
        </div>
        <div class="related-grid" id="relatedArticlesContainer">
            <?php foreach ($related as $r):
                $rimg = $r['image'] ? img_optimize($r['image'], 'w=480&h=300&fit=crop') : '';
                $rurl = BLOG_BASE . '/articulo/' . rawurlencode($r['slug']);
            ?>
            <article class="related-article">
                <a href="<?= e($rurl) ?>">
                    <?php if ($rimg): ?>
                        <img class="related-article-image" src="<?= e($rimg) ?>" alt="<?= e($r['title']) ?>" width="480" height="300" loading="lazy">
                    <?php else: ?>
                        <div class="related-article-image"></div>
                    <?php endif; ?>
                </a>
                <div class="related-article-content">
                    <span class="pill pill-ghost"><?= e($r['category']) ?></span>
                    <h4 class="related-article-title"><a href="<?= e($rurl) ?>"><?= e($r['title']) ?></a></h4>
                    <p class="related-article-excerpt"><?= e($r['excerpt']) ?></p>
                    <a href="<?= e($rurl) ?>" class="related-article-link">Leer más →</a>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

    <?php include __DIR__ . '/partials/footer.php'; ?>

    <script type="application/ld+json">
    <?= json_encode([
        '@context' => 'https://schema.org',
        '@type'    => 'Article',
        'headline' => $article['title'],
        'description' => $desc,
        'image'    => $ogImage,
        'datePublished' => $article['date_raw'],
        'dateModified'  => $article['last_mod'],
        'author'   => ['@type' => 'Person', 'name' => $article['author']],
        'publisher' => [
            '@type' => 'Organization',
            'name'  => 'enCalma Vacacional',
            'logo'  => ['@type' => 'ImageObject', 'url' => SITE_URL . '/logo.png'],
        ],
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonical],
        'articleSection'   => $article['category'],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
    </script>
    <script type="application/ld+json">
    <?= json_encode([
        '@context' => 'https://schema.org',
        '@type'    => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Blog', 'item' => BLOG_URL . '/'],
            ['@type' => 'ListItem', 'position' => 2, 'name' => $article['category']],
            ['@type' => 'ListItem', 'position' => 3, 'name' => $article['title'], 'item' => $canonical],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
    </script>

    <script src="<?= e(BLOG_BASE) ?>/nav.js"></script>
    <script src="<?= e(BLOG_BASE) ?>/article-ui.js"></script>
</body>
</html>
