<?php
/**
 * Configuración del blog enCalma (PHP / SSR sobre Prismic).
 *
 * SEGURIDAD: el token de Prismic vive aquí, en el servidor — nunca se envía al
 * navegador (al contrario que el montaje CSR anterior, donde estaba en el JS).
 * El token actual quedó expuesto en el repo: ROTARLO en Prismic antes de producción.
 */

// --- Prismic ---
define('PRISMIC_REPO',  'encalmavacacionalblog');
define('PRISMIC_TOKEN', 'MC5hYmszN1JBQUFDUUFEbWFH.77-9V0Dvv73vv71-L--_vV8_77-9emDvv73vv71H77-977-977-977-9SlMe77-977-9Ye-_vQ0hQV9i');
define('PRISMIC_API',   'https://' . PRISMIC_REPO . '.cdn.prismic.io/api/v2');

// --- Sitio ---
// Dominio de producción. El blog cuelga de /blog (subdirectorio del WordPress).
define('SITE_URL',  'https://encalmavacacional.com');
define('BLOG_BASE', '/blog');                 // ruta pública del blog
define('BLOG_URL',  SITE_URL . BLOG_BASE);    // URL absoluta del blog
define('OG_FALLBACK_IMAGE', SITE_URL . '/og-image.jpg');

// --- Caché ---
// Respuestas de Prismic cacheadas en disco para no pegar a la API en cada visita.
define('CACHE_DIR', __DIR__ . '/cache');
define('CACHE_TTL', 600); // segundos (10 min). Se puede invalidar con webhook de Prismic.

// Secreto compartido con el webhook de Prismic. Prismic lo envía en el campo
// "secret" del JSON al publicar; webhook.php solo purga si coincide.
// CÁMBIALO por una cadena larga y aleatoria, y pon la misma en Prismic.
define('WEBHOOK_SECRET', 'j*F8Pwh!x6khWyo0');

// Zona horaria para fechas
date_default_timezone_set('Europe/Madrid');
