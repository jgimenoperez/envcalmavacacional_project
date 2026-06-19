<?php
/**
 * Capa de acceso a Prismic vía Content API (REST/JSON) con cURL + caché en disco.
 * Porta la lógica que antes vivía en js/main.js y js/article.js, pero server-side.
 */

require_once __DIR__ . '/../config.php';

/** GET con cURL devolviendo el cuerpo como array asociativo (JSON decodificado). */
function prismic_http_get($url)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        CURLOPT_USERAGENT      => 'enCalmaBlog/1.0 (+' . SITE_URL . ')',
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $code >= 400) {
        return null;
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

/** Lee de caché si está fresca; si no, ejecuta $producer(), cachea y devuelve. */
function prismic_cached($key, callable $producer)
{
    if (!is_dir(CACHE_DIR)) {
        @mkdir(CACHE_DIR, 0755, true);
    }
    $file = CACHE_DIR . '/' . preg_replace('/[^a-z0-9_\-]/i', '_', $key) . '.json';

    if (is_file($file) && (time() - filemtime($file)) < CACHE_TTL) {
        $cached = json_decode(file_get_contents($file), true);
        if ($cached !== null) {
            return $cached;
        }
    }

    $value = $producer();
    if ($value !== null) {
        @file_put_contents($file, json_encode($value), LOCK_EX);
    }
    return $value;
}

/** master ref de Prismic (cacheado). */
function prismic_master_ref()
{
    return prismic_cached('master_ref', function () {
        $data = prismic_http_get(PRISMIC_API . '?access_token=' . urlencode(PRISMIC_TOKEN));
        if (!$data || empty($data['refs'])) {
            return null;
        }
        foreach ($data['refs'] as $ref) {
            if (!empty($ref['isMasterRef'])) {
                return $ref['ref'];
            }
        }
        return $data['refs'][0]['ref'] ?? null;
    });
}

/** Ejecuta una query de búsqueda contra Prismic y devuelve los resultados crudos. */
function prismic_search($q, $extra = '')
{
    $ref = prismic_master_ref();
    if (!$ref) {
        return [];
    }
    $url = PRISMIC_API . '/documents/search'
        . '?ref=' . urlencode($ref)
        . '&q=' . urlencode($q)
        . '&access_token=' . urlencode(PRISMIC_TOKEN)
        . $extra;

    $data = prismic_http_get($url);
    return $data['results'] ?? [];
}

/** Normaliza un documento Prismic a la forma que usan las plantillas. */
function prismic_map_doc($doc)
{
    $c = $doc['data'] ?? [];
    return [
        'id'       => $doc['id'] ?? '',
        'uid'      => $doc['uid'] ?? '',
        'slug'     => $doc['uid'] ?? '',
        'title'    => $c['titulo'][0]['text']   ?? 'Sin título',
        'category' => $c['categoria']           ?? 'General',
        'excerpt'  => $c['resumen'][0]['text']  ?? '',
        'author'   => $c['autor']               ?? 'Anónimo',
        'image'    => $c['imagen_hero']['url']  ?? '',
        'date_raw' => $c['fecha']               ?? ($doc['first_publication_date'] ?? ''),
        'content'  => $c['contenido']           ?? [],
        'last_mod' => $doc['last_publication_date'] ?? ($doc['first_publication_date'] ?? ''),
    ];
}

/** Todos los artículos (lista del índice / relacionados / sitemap), cacheado. */
function prismic_all_articles()
{
    $docs = prismic_cached('all_articles', function () {
        return prismic_search(
            '[[at(document.type,"blog_post")]]',
            '&pageSize=100&orderings=' . urlencode('[document.first_publication_date desc]')
        );
    });
    return array_map('prismic_map_doc', $docs ?: []);
}

/** Un artículo por slug (uid). Devuelve null si no existe → permite 404 real. */
function prismic_article_by_slug($slug)
{
    $docs = prismic_cached('article_' . $slug, function () use ($slug) {
        return prismic_search('[[at(my.blog_post.uid,"' . $slug . '")]]');
    });
    if (empty($docs)) {
        return null;
    }
    return prismic_map_doc($docs[0]);
}
