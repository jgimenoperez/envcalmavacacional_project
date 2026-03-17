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

// Función para obtener el slug de la URL
function getArticleSlugFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
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

// Función para convertir contenido de Prismic a HTML
function parsePrismicContent(blocks) {
    if (!blocks || blocks.length === 0) return '';

    let html = '';

    blocks.forEach(block => {
        const text = (block.text || '').trim();

        // Saltar bloques vacíos
        if (!text) return;

        if (block.type === 'heading2' || block.type === 'heading1') {
            html += `<h3 class="article-section-title">${text}</h3>`;
        } else if (block.type === 'heading3') {
            html += `<h4 class="article-section-title" style="font-size: 22px;">${text}</h4>`;
        } else if (block.type === 'paragraph' && isTitle(block)) {
            html += `<h3 class="article-section-title">${text}</h3>`;
        } else if (block.type === 'paragraph') {
            html += `<p class="article-paragraph">${applySpans(text, block.spans)}</p>`;
        } else if (block.type === 'list-item') {
            html += `<li class="article-paragraph">${applySpans(text, block.spans)}</li>`;
        } else if (block.type === 'o-list-item') {
            html += `<li class="article-paragraph">${applySpans(text, block.spans)}</li>`;
        } else if (block.type === 'image') {
            const src = block.url || '';
            if (src) {
                html += `<img class="article-image" src="${src}" alt="${block.alt || ''}" style="width:100%; height:auto; border-radius:4px;">`;
            }
        }
    });

    return html;
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

    container.innerHTML = related.map(article => `
        <article class="related-article">
            <div class="related-article-image"></div>
            <div class="related-article-content">
                <span class="related-article-category">${article.category}</span>
                <h4 class="related-article-title">${article.title}</h4>
                <p class="related-article-excerpt">${article.excerpt}</p>
                <a href="article.html?slug=${article.slug}" class="related-article-link">Leer más →</a>
            </div>
        </article>
    `).join('');
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

    // Renderizar imagen hero (optimizada para web)
    const heroImage = document.querySelector('.article-hero-image');
    if (article.image) {
        let imageUrl = article.image;
        // Prismic CDN optimización: si ya tiene parámetros, añadimos con &, si no con ?
        if (article.image.includes('?')) {
            imageUrl = `${article.image}&w=1440&h=500&fit=crop`;
        } else {
            imageUrl = `${article.image}?w=1440&h=500&fit=crop`;
        }
        heroImage.style.backgroundImage = `url(${imageUrl})`;
        heroImage.style.backgroundSize = 'cover';
        heroImage.style.backgroundPosition = 'center';
    }

    // Renderizar meta información
    document.getElementById('articleCategory').textContent = article.category.toUpperCase();
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleDate').textContent = article.date;
    document.getElementById('articleAuthor').textContent = article.author;

    // Renderizar contenido
    renderArticleContent(article);

    // Renderizar artículos relacionados
    await renderRelatedArticles(article.slug);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadArticle);
