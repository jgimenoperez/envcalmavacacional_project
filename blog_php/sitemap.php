<?php
/**
 * sitemap.xml dinámico generado desde Prismic.
 * Mapeado en .htaccess a /blog/sitemap.xml
 */
require_once __DIR__ . '/lib/prismic.php';
require_once __DIR__ . '/lib/render.php';

header('Content-Type: application/xml; charset=utf-8');

$articles = prismic_all_articles();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Índice del blog
echo "  <url>\n";
echo '    <loc>' . e(BLOG_URL . '/') . "</loc>\n";
echo "    <changefreq>daily</changefreq>\n";
echo "    <priority>0.8</priority>\n";
echo "  </url>\n";

// Un <url> por artículo
foreach ($articles as $a) {
    $loc = BLOG_URL . '/articulo/' . rawurlencode($a['slug']);
    $lastmod = $a['last_mod'] ? date('Y-m-d', strtotime($a['last_mod'])) : '';
    echo "  <url>\n";
    echo '    <loc>' . e($loc) . "</loc>\n";
    if ($lastmod) {
        echo '    <lastmod>' . e($lastmod) . "</lastmod>\n";
    }
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.7</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>' . "\n";
