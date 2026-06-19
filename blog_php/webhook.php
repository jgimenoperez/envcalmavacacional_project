<?php
/**
 * Webhook de Prismic → invalida y regenera el cache del blog.
 *
 * Flujo: publicas en Prismic → Prismic hace POST a esta URL con un JSON que
 * incluye {"secret": "..."} → si el secreto coincide, borramos todos los .json
 * del cache y los regeneramos (warm) para que la primera visita salga rápida.
 *
 * Config en Prismic: Settings → Webhooks → URL = https://encalmavacacional.com/blog/webhook.php
 * y "Secret" = el mismo valor de WEBHOOK_SECRET en config.php.
 */

require_once __DIR__ . '/lib/prismic.php';

header('Content-Type: application/json; charset=utf-8');

// --- 1. Leer y validar el secreto ---------------------------------------
$raw     = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];

// Prismic manda "secret" en el body. Permitimos también ?secret= para pruebas.
$given = $payload['secret'] ?? ($_GET['secret'] ?? '');

if (!hash_equals(WEBHOOK_SECRET, (string) $given)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'forbidden']);
    exit;
}

// Prismic envía un ping "test-trigger" desde el botón de prueba: lo aceptamos.
$type = $payload['type'] ?? 'manual';

// --- 2. Purga: borrar todos los .json del cache --------------------------
$deleted = 0;
foreach (glob(CACHE_DIR . '/*.json') as $file) {
    if (@unlink($file)) {
        $deleted++;
    }
}

// --- 3. Warm: regenerar cache (master ref + listado + cada artículo) -----
$articles = prismic_all_articles();      // reescribe master_ref.json + all_articles.json
$warmed   = 0;
foreach ($articles as $a) {
    if (!empty($a['slug'])) {
        prismic_article_by_slug($a['slug']); // reescribe article_<slug>.json
        $warmed++;
    }
}

echo json_encode([
    'ok'       => true,
    'type'     => $type,
    'deleted'  => $deleted,
    'articles' => count($articles),
    'warmed'   => $warmed,
    'at'       => date('c'),
]);
