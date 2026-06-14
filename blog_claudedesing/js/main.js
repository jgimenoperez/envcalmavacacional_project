// Configuración de Prismic
const PRISMIC_REPO = 'encalmavacacionalblog';
const PRISMIC_TOKEN = 'MC5hYmszN1JBQUFDUUFEbWFH.77-9V0Dvv73vv71-L--_vV8_77-9emDvv73vv71H77-977-977-977-9SlMe77-977-9Ye-_vQ0hQV9i';
const PRISMIC_API = `https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`;

// Estado global
let allArticles = [];
let activeCategory = null;
let searchTerm = '';

// Paso 1: Obtener el master ref de Prismic
async function getMasterRef() {
    const response = await fetch(`${PRISMIC_API}?access_token=${PRISMIC_TOKEN}`);
    const data = await response.json();
    const masterRef = data.refs.find(r => r.isMasterRef);
    return masterRef.ref;
}

// Paso 2: Obtener artículos de Prismic
async function getArticlesFromPrismic() {
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
                readTime: estimateReadTime(content.contenido),
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

// Estimar tiempo de lectura a partir del cuerpo (≈200 palabras/min)
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

// Función para extraer categorías únicas y contar artículos
function getCategories(articles) {
    const categoryMap = {};
    articles.forEach(article => {
        const cat = article.category;
        if (!categoryMap[cat]) {
            categoryMap[cat] = 0;
        }
        categoryMap[cat]++;
    });
    return categoryMap;
}

// Función para renderizar categorías dinámicas (sidebar — Guía Lateral)
function renderCategories(categories) {
    const container = document.getElementById('categoriesGrid');
    const totalArticles = Object.values(categories).reduce((sum, count) => sum + count, 0);

    let html = `
        <button class="cat-item ${activeCategory === null ? 'cat-active' : ''}" data-category="all">
            <span class="cat-name">Todo</span>
            <span class="cat-count">${totalArticles}</span>
        </button>
    `;

    html += Object.entries(categories).map(([name, count]) => `
        <button class="cat-item ${activeCategory === name ? 'cat-active' : ''}" data-category="${name}">
            <span class="cat-name">${name}</span>
            <span class="cat-count">${count}</span>
        </button>
    `).join('');

    container.innerHTML = html;

    // Añadir eventos de clic para filtrar
    container.querySelectorAll('.cat-item').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;

            if (category === 'all') {
                activeCategory = null;
            } else if (activeCategory === category) {
                activeCategory = null;
            } else {
                activeCategory = category;
            }

            applyFilters();
            renderCategories(getCategories(allArticles));
        });
    });
}

// Combina filtro de categoría + búsqueda y repinta la lista
function applyFilters() {
    let filtered = allArticles;

    if (activeCategory) {
        filtered = filtered.filter(a => a.category === activeCategory);
    }

    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        );
    }

    renderArticles(filtered);
}

// Función para renderizar los artículos (lista vertical de tarjetas horizontales)
function renderArticles(articles) {
    const container = document.getElementById('articlesContainer');

    if (articles.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay artículos que coincidan con tu búsqueda.</p>';
        return;
    }

    container.innerHTML = articles.map(article => {
        let imageUrl = '';
        if (article.image) {
            // Prismic CDN optimización: si ya tiene parámetros, añadimos con &, si no con ?
            if (article.image.includes('?')) {
                imageUrl = `${article.image}&w=480&h=360&fit=crop`;
            } else {
                imageUrl = `${article.image}?w=480&h=360&fit=crop`;
            }
        }

        return `
            <article class="post-card">
                <a class="post-card-media" href="article.html?slug=${article.slug}">
                    ${imageUrl
                        ? `<img src="${imageUrl}" alt="${article.title}" width="240" height="180" loading="lazy">`
                        : `<span class="post-card-media-empty"></span>`
                    }
                </a>
                <div class="post-card-body">
                    <span class="pill pill-ghost">${article.category}</span>
                    <h3 class="post-card-title"><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                    <p class="post-card-excerpt">${article.excerpt}</p>
                    <div class="post-card-meta">${article.date} · Por ${article.author} · ${article.readTime} min de lectura</div>
                </div>
            </article>
        `;
    }).join('');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    allArticles = await getArticlesFromPrismic();
    renderArticles(allArticles);

    // Renderizar categorías dinámicas
    const categories = getCategories(allArticles);
    renderCategories(categories);

    // Buscador (Guía Lateral)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value.trim();
            applyFilters();
        });
    }
});
