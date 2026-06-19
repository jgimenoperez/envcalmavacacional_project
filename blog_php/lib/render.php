<?php
/**
 * Renderizado server-side del rich text de Prismic a HTML.
 * Porta js/article.js (applySpans, parsePrismicContent, slugify, estimateReadTime).
 * Corrige el salto de jerarquía del montaje CSR: heading2 → <h2> (antes <h3>).
 */

/** Escape seguro para HTML. */
function e($s)
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Optimización de imagen vía CDN Prismic (añade params manteniendo los existentes). */
function img_optimize($url, $params)
{
    if (!$url) {
        return '';
    }
    return $url . (strpos($url, '?') !== false ? '&' : '?') . $params;
}

/** Fecha legible en español: "12 de marzo de 2026". */
function format_date_es($dateString)
{
    if (!$dateString) {
        return 'Sin fecha';
    }
    $ts = strtotime($dateString);
    if ($ts === false) {
        return 'Sin fecha';
    }
    $meses = [1=>'enero','febrero','marzo','abril','mayo','junio','julio',
              'agosto','septiembre','octubre','noviembre','diciembre'];
    return (int)date('j', $ts) . ' de ' . $meses[(int)date('n', $ts)] . ' de ' . date('Y', $ts);
}

/** Tiempo estimado de lectura (~200 palabras/min). */
function estimate_read_time($blocks)
{
    if (empty($blocks)) {
        return 1;
    }
    $text = '';
    foreach ($blocks as $b) {
        $text .= ' ' . ($b['text'] ?? '');
    }
    $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);
    return max(1, (int)round(count($words) / 200));
}

/** Slug para anclas del índice (TOC). */
function slugify($text)
{
    $text = mb_strtolower($text, 'UTF-8');
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);   // quita acentos
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = trim($text);
    return preg_replace('/\s+/', '-', $text);
}

/**
 * Aplica spans (strong, em, hyperlink) sobre el texto de un bloque.
 * Trabaja por posiciones de byte como hace Prismic; procesa de derecha a izquierda.
 */
function apply_spans($text, $spans)
{
    if (empty($spans)) {
        return e($text);
    }
    // Construimos por segmentos para poder escapar cada trozo de texto.
    usort($spans, function ($a, $b) {
        return $a['start'] <=> $b['start'];
    });

    $result = '';
    $cursor = 0;
    foreach ($spans as $span) {
        $start = $span['start'];
        $end   = $span['end'];
        if ($start < $cursor) {
            continue; // spans solapados: ignoramos el anidado para no romper el HTML
        }
        $result .= e(substr($text, $cursor, $start - $cursor));
        $inner = e(substr($text, $start, $end - $start));

        switch ($span['type']) {
            case 'strong':
                $result .= '<strong>' . $inner . '</strong>';
                break;
            case 'em':
                $result .= '<em>' . $inner . '</em>';
                break;
            case 'hyperlink':
                $url = $span['data']['url'] ?? '#';
                $result .= '<a href="' . e($url) . '" target="_blank" rel="noopener">' . $inner . '</a>';
                break;
            default:
                $result .= $inner;
        }
        $cursor = $end;
    }
    $result .= e(substr($text, $cursor));
    return $result;
}

/** ¿El párrafo es realmente un título? (todo en negrita y corto). */
function block_is_title($block)
{
    if (empty($block['spans'])) {
        return false;
    }
    $text = trim($block['text'] ?? '');
    if ($text === '' || mb_strlen($text) > 100) {
        return false;
    }
    foreach ($block['spans'] as $s) {
        if ($s['type'] === 'strong' && $s['start'] === 0 && $s['end'] >= strlen($text)) {
            return true;
        }
    }
    return false;
}

/**
 * Convierte el contenido de Prismic a HTML y rellena $headings (por referencia)
 * con los subtítulos para construir el TOC lateral.
 * Agrupa list-item / o-list-item en <ul>/<ol> correctamente.
 */
function parse_prismic_content($blocks, &$headings = [])
{
    $headings = [];
    if (empty($blocks)) {
        return '';
    }

    $push_heading = function ($text) use (&$headings) {
        $id = 'sec-' . count($headings) . '-' . slugify($text);
        $headings[] = ['id' => $id, 'text' => $text];
        return $id;
    };

    $html = '';
    $listOpen = null; // 'ul' | 'ol' | null

    $closeList = function () use (&$html, &$listOpen) {
        if ($listOpen) {
            $html .= '</' . $listOpen . '>';
            $listOpen = null;
        }
    };

    foreach ($blocks as $block) {
        $type = $block['type'] ?? '';
        $text = trim($block['text'] ?? '');

        if ($text === '' && $type !== 'image') {
            continue;
        }

        // Gestionar apertura/cierre de listas
        if ($type === 'list-item' || $type === 'o-list-item') {
            $want = $type === 'list-item' ? 'ul' : 'ol';
            if ($listOpen !== $want) {
                $closeList();
                $html .= '<' . $want . ' class="article-list">';
                $listOpen = $want;
            }
            $html .= '<li class="article-paragraph">' . apply_spans($block['text'], $block['spans'] ?? []) . '</li>';
            continue;
        }
        $closeList();

        if ($type === 'heading1' || $type === 'heading2') {
            $id = $push_heading($text);
            $html .= '<h2 class="article-section-title" id="' . e($id) . '">' . e($text) . '</h2>';
        } elseif ($type === 'heading3') {
            $id = $push_heading($text);
            $html .= '<h3 class="article-section-title article-section-title-sm" id="' . e($id) . '">' . e($text) . '</h3>';
        } elseif ($type === 'paragraph' && block_is_title($block)) {
            $id = $push_heading($text);
            $html .= '<h2 class="article-section-title" id="' . e($id) . '">' . e($text) . '</h2>';
        } elseif ($type === 'paragraph') {
            $html .= '<p class="article-paragraph">' . apply_spans($block['text'], $block['spans'] ?? []) . '</p>';
        } elseif ($type === 'image') {
            $src = $block['url'] ?? ($block['image']['url'] ?? '');
            $alt = $block['alt'] ?? ($block['image']['alt'] ?? 'Imagen del artículo');
            if ($src) {
                $imageUrl = img_optimize($src, 'w=800&fit=max');
                $html .= '<figure class="article-figure">'
                    . '<img class="article-image" src="' . e($imageUrl) . '" alt="' . e($alt) . '" loading="lazy">'
                    . '<figcaption>' . e($alt) . '</figcaption></figure>';
            }
        }
    }
    $closeList();
    return $html;
}
