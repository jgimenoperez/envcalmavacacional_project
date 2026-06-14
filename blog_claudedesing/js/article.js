// Configuración de Prismic
const PRISMIC_REPO = 'encalmavacacionalblog';
const PRISMIC_TOKEN = 'MC5hYmszN1JBQUFDUUFEbWFH.77-9V0Dvv73vv71-L--_vV8_77-9emDvv73vv71H77-977-977-977-9SlMe77-977-9Ye-_vQ0hQV9i';
const PRISMIC_API = `https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`;

// Paso 1: Obtener el master ref de Prismic
async function getMasterRef() {
    const response = await fetch(`${PRISMIC_API}?access_token=${PRISMIC_TOKEN}`);
    const data = await response.json();
    const masterRef = data.refs.find(r => r.isMasterRef);
    return masterRef.ref;
}

// Función para obtener un artículo específico de Prismic por slug
async function getArticleFromPrismic(slug) {
    try {
        const ref = await getMasterRef();
        const query = encodeURIComponent(`[[at(my.blog_post.uid,"${slug}")]]`);
        const url = `${PRISMIC_API}/documents/search?ref=${ref}&q=${query}&access_token=${PRISMIC_TOKEN}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length === 0) {
            return null;
        }

        const doc = data.results[0];
        const content = doc.data;

        return {
            id: doc.id,
            uid: doc.uid,
            title: content.titulo?.[0]?.text || 'Sin título',
            category: content.categoria || 'General',
            excerpt: content.resumen?.[0]?.text || '',
            date: formatDate(content.fecha),
            author: content.autor || 'Anónimo',
            readTime: estimateReadTime(content.contenido),
            slug: doc.uid,
            content: content,
            rawContent: content.contenido || [],
            image: content.imagen_hero?.url || ''
        };
    } catch (error) {
        console.error('Error al obtener artículo de Prismic:', error);
        return null;
    }
}

// Función para obtener todos los artículos (para artículos relacionados)
async function getAllArticlesFromPrismic() {
    try {
        const ref = await getMasterRef();
        const query = encodeURIComponent('[[at(document.type,"blog_post")]]');
        const url = `${PRISMIC_API}/documents/search?ref=${ref}&q=${query}&access_token=${PRISMIC_TOKEN}&pageSize=100&orderings=[document.first_publication_date desc]`;

        const response = await fetch(url);
        const data = await response.json();

        return data.results.map(doc => {
            const content = doc.data;
            return {
                id: doc.id,
                uid: doc.uid,
                title: content.titulo?.[0]?.text || 'Sin título',
                category: content.categoria || 'General',
                excerpt: content.resumen?.[0]?.text || '',
                image: content.imagen_hero?.url || '',
                date: formatDate(content.fecha),
                author: content.autor || 'Anónimo',
                slug: doc.uid,
                content: content
            };
        });
    } catch (error) {
        console.error('Error al obtener artículos de Prismic:', error);
        return [];
    }
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Estimar tiempo de lectura (≈200 palabras/min)
function estimateReadTime(blocks) {
    if (!blocks || blocks.length === 0) return 1;
    const words = blocks
        .map(b => (b.text || ''))
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

// Función para obtener el slug de la URL
function getArticleSlugFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

// Convertir texto a slug para anclas del índice
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

// Función para aplicar spans (negrita, cursiva, enlaces) al texto
function applySpans(text, spans) {
    if (!spans || spans.length === 0) return text;

    // Ordenar spans de mayor a menor posición para no romper índices
    const sorted = [...spans].sort((a, b) => b.start - a.start);

    let result = text;
    sorted.forEach(span => {
        const before = result.slice(0, span.start);
        const content = result.slice(span.start, span.end);
        const after = result.slice(span.end);

        if (span.type === 'strong') {
            result = before + `<strong>${content}</strong>` + after;
        } else if (span.type === 'em') {
            result = before + `<em>${content}</em>` + after;
        } else if (span.type === 'hyperlink') {
            const url = span.data?.url || '#';
            result = before + `<a href="${url}" target="_blank">${content}</a>` + after;
        }
    });

    return result;
}

// Detectar si un párrafo es un "título" (todo en negrita y texto corto)
function isTitle(block) {
    if (!block.spans || block.spans.length === 0) return false;
    const text = block.text.trim();
    if (text.length === 0 || text.length > 100) return false;

    // Si todo el texto está en negrita, es un título
    const boldSpan = block.spans.find(s => s.type === 'strong');
    if (boldSpan && boldSpan.start === 0 && boldSpan.end >= text.length) return true;

    return false;
}

// Acumula los subtítulos detectados para construir el índice lateral
let tocHeadings = [];

// Función para convertir contenido de Prismic a HTML
function parsePrismicContent(blocks) {
    if (!blocks || blocks.length === 0) return '';

    let html = '';
    tocHeadings = [];

    const pushHeading = (text) => {
        const id = `sec-${tocHeadings.length}-${slugify(text)}`;
        tocHeadings.push({ id, text });
        return id;
    };

    blocks.forEach(block => {
        const text = (block.text || '').trim();

        // Saltar bloques vacíos (pero no imágenes, que no tienen text)
        if (!text && block.type !== 'image') return;

        if (block.type === 'heading2' || block.type === 'heading1') {
            const id = pushHeading(text);
            html += `<h3 class="article-section-title" id="${id}">${text}</h3>`;
        } else if (block.type === 'heading3') {
            const id = pushHeading(text);
            html += `<h4 class="article-section-title article-section-title-sm" id="${id}">${text}</h4>`;
        } else if (block.type === 'paragraph' && isTitle(block)) {
            const id = pushHeading(text);
            html += `<h3 class="article-section-title" id="${id}">${text}</h3>`;
        } else if (block.type === 'paragraph') {
            html += `<p class="article-paragraph">${applySpans(text, block.spans)}</p>`;
        } else if (block.type === 'list-item') {
            html += `<li class="article-paragraph">${applySpans(text, block.spans)}</li>`;
        } else if (block.type === 'o-list-item') {
            html += `<li class="article-paragraph">${applySpans(text, block.spans)}</li>`;
        } else if (block.type === 'image') {
            let src = '';
            let alt = '';

            // Prismic puede devolver la imagen en diferentes formatos
            if (block.url) {
                src = block.url;
                alt = block.alt || 'Imagen del artículo';
            } else if (block.image && block.image.url) {
                src = block.image.url;
                alt = block.image.alt || 'Imagen del artículo';
            }

            if (src) {
                // Optimizar imagen para web (ancho máximo 800px, mantener proporción)
                let imageUrl = src;
                if (src.includes('?')) {
                    imageUrl = `${src}&w=800&fit=max`;
                } else {
                    imageUrl = `${src}?w=800&fit=max`;
                }
                html += `<figure class="article-figure"><img class="article-image" src="${imageUrl}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`;
            }
        }
    });

    return html;
}

// Construir el índice lateral (TOC) a partir de los subtítulos
function renderToc() {
    const tocList = document.getElementById('tocList');
    if (!tocList) return;

    if (tocHeadings.length === 0) {
        const tocPanel = document.getElementById('articleToc');
        if (tocPanel) tocPanel.style.display = 'none';
        return;
    }

    tocList.innerHTML = tocHeadings
        .map((h, i) => `<a href="#${h.id}" class="toc-link ${i === 0 ? 'toc-active' : ''}" data-target="${h.id}">${h.text}</a>`)
        .join('');

    // Resaltado del enlace activo según scroll
    const links = Array.from(tocList.querySelectorAll('.toc-link'));
    const targets = tocHeadings.map(h => document.getElementById(h.id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(l => l.classList.toggle('toc-active', l.dataset.target === entry.target.id));
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    targets.forEach(t => observer.observe(t));
}

// Función para renderizar el contenido del artículo desde Prismic
function renderArticleContent(article) {
    const container = document.getElementById('articleBody');

    if (!article.rawContent || article.rawContent.length === 0) {
        container.innerHTML = '<p>No hay contenido disponible.</p>';
        return;
    }

    const contentHTML = parsePrismicContent(article.rawContent);
    container.innerHTML = contentHTML;
    renderToc();
}

// Configurar botones de compartir
function setupShare(article) {
    const url = window.location.href;
    const text = article.title;

    const wa = document.getElementById('shareWhatsapp');
    const mail = document.getElementById('shareEmail');
    const copy = document.getElementById('shareCopy');

    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    if (mail) mail.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
    if (copy) {
        copy.addEventListener('click', function(e) {
            e.preventDefault();
            navigator.clipboard?.writeText(url);
            copy.classList.add('copied');
            setTimeout(() => copy.classList.remove('copied'), 1500);
        });
    }
}

// Función para renderizar artículos relacionados
async function renderRelatedArticles(currentSlug) {
    const container = document.getElementById('relatedArticlesContainer');
    const allArticles = await getAllArticlesFromPrismic();
    const related = allArticles.filter(article => article.slug !== currentSlug).slice(0, 3);

    if (related.length === 0) {
        container.innerHTML = '<p>No hay artículos relacionados.</p>';
        return;
    }

    container.innerHTML = related.map(article => {
        let imageUrl = '';
        if (article.image) {
            if (article.image.includes('?')) {
                imageUrl = `${article.image}&w=480&h=300&fit=crop`;
            } else {
                imageUrl = `${article.image}?w=480&h=300&fit=crop`;
            }
        }
        const imageStyle = imageUrl
            ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"`
            : '';
        return `
        <article class="related-article">
            <a href="article.html?slug=${article.slug}">
                <div class="related-article-image" ${imageStyle}></div>
            </a>
            <div class="related-article-content">
                <span class="pill pill-ghost">${article.category}</span>
                <h4 class="related-article-title"><a href="article.html?slug=${article.slug}">${article.title}</a></h4>
                <p class="related-article-excerpt">${article.excerpt}</p>
                <a href="article.html?slug=${article.slug}" class="related-article-link">Leer más →</a>
            </div>
        </article>
    `;
    }).join('');
}

// Función para cargar y renderizar el artículo
async function loadArticle() {
    const slug = getArticleSlugFromURL();

    if (!slug) {
        document.getElementById('articleBody').innerHTML = '<p>Artículo no encontrado.</p>';
        return;
    }

    const article = await getArticleFromPrismic(slug);

    if (!article) {
        document.getElementById('articleBody').innerHTML = '<p>Artículo no encontrado.</p>';
        return;
    }

    // Renderizar imagen de portada (optimizada para web)
    const heroImage = document.querySelector('.article-hero-image');
    if (article.image) {
        let imageUrl = article.image;
        if (article.image.includes('?')) {
            imageUrl = `${article.image}&w=1200&h=520&fit=crop`;
        } else {
            imageUrl = `${article.image}?w=1200&h=520&fit=crop`;
        }
        heroImage.style.backgroundImage = `url(${imageUrl})`;
        heroImage.style.backgroundSize = 'cover';
        heroImage.style.backgroundPosition = 'center';
    } else {
        heroImage.style.display = 'none';
    }

    // Breadcrumb
    document.getElementById('breadcrumbCategory').textContent = article.category;
    document.getElementById('breadcrumbTitle').textContent = article.title;

    // Renderizar meta información
    document.getElementById('articleCategory').textContent = article.category;
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleDate').textContent = article.date;
    document.getElementById('articleAuthor').textContent = article.author;
    document.getElementById('articleReadTime').textContent = `${article.readTime} min de lectura`;
    document.title = `${article.title} · enCalma Vacacional`;

    // Renderizar contenido + índice
    renderArticleContent(article);

    // Compartir
    setupShare(article);

    // Renderizar artículos relacionados
    await renderRelatedArticles(article.slug);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadArticle);
