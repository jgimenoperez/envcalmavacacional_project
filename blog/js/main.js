// Configuración de Prismic
const PRISMIC_REPO = 'encalmavacacionalblog';
const PRISMIC_TOKEN = 'MC5hYmszN1JBQUFDUUFEbWFH.77-9V0Dvv73vv71-L--_vV8_77-9emDvv73vv71H77-977-977-977-9SlMe77-977-9Ye-_vQ0hQV9i';
const PRISMIC_API = `https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`;

// Estado global
let allArticles = [];
let activeCategory = null;

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

// Función para renderizar categorías dinámicas
function renderCategories(categories) {
    const container = document.getElementById('categoriesGrid');

    container.innerHTML = Object.entries(categories).map(([name, count]) => `
        <div class="category-card ${activeCategory === name ? 'category-active' : ''}" data-category="${name}">
            <h4 class="category-name">${name}</h4>
            <p class="category-desc">${count} ${count === 1 ? 'artículo' : 'artículos'}</p>
        </div>
    `).join('');

    // Añadir eventos de clic para filtrar
    container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;

            if (activeCategory === category) {
                // Desactivar filtro
                activeCategory = null;
            } else {
                activeCategory = category;
            }

            // Re-renderizar
            const filtered = activeCategory
                ? allArticles.filter(a => a.category === activeCategory)
                : allArticles;

            renderArticles(filtered);
            renderCategories(getCategories(allArticles));
        });
    });
}

// Función para renderizar los artículos
function renderArticles(articles) {
    const container = document.getElementById('articlesContainer');

    if (articles.length === 0) {
        container.innerHTML = '<p>No hay artículos disponibles.</p>';
        return;
    }

    container.innerHTML = articles.map(article => `
        <article class="article-item">
            ${article.image
                ? `<img class="article-image" src="${article.image}" alt="${article.title}">`
                : `<div class="article-image"></div>`
            }
            <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.excerpt}</p>
                <p style="font-size: 12px; color: #999999;">
                    ${article.date} · Por ${article.author}
                </p>
                <a href="article.html?slug=${article.slug}" class="article-link">Leer más →</a>
            </div>
        </article>
    `).join('');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    allArticles = await getArticlesFromPrismic();
    renderArticles(allArticles);

    // Renderizar categorías dinámicas
    const categories = getCategories(allArticles);
    renderCategories(categories);
});
