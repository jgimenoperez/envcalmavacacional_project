// Datos de ejemplo para artículos (será reemplazado por datos de Prismic)
const articlesData = [
    {
        id: 1,
        title: 'Playas de Sagunto: guía completa de arena, sol y naturaleza',
        category: 'Playas',
        excerpt: 'Descubre las playas más hermosas de Sagunto con aguas cristalinas y toda la infraestructura necesaria. Desde playas tranquilas para familias hasta calas escondidas para los aventureros.',
        date: '15 de marzo de 2026',
        author: 'Laura Martínez',
        slug: 'playas-sagunto-guia'
    },
    {
        id: 2,
        title: 'Los mejores restaurantes de Sagunto: paella, arroces y marisco fresco',
        category: 'Gastronomía',
        excerpt: 'Disfruta de la mejor gastronomía valenciana en Sagunto. Restaurantes tradicionales y modernos donde degustar paella, arroces, fideuá y marisco fresco directo del Mediterráneo.',
        date: '12 de marzo de 2026',
        author: 'Miguel Pérez',
        slug: 'restaurantes-gastronomia-sagunto'
    },
    {
        id: 3,
        title: 'Castillo de Sagunto y Anfiteatro Romano: historia milenaria',
        category: 'Patrimonio',
        excerpt: 'Explora el patrimonio histórico de Sagunto visitando su icónico castillo medieval y el antiguo anfiteatro romano. Monumentos que cuentan 2000 años de historia.',
        date: '8 de marzo de 2026',
        author: 'Carlos Ruiz',
        slug: 'castillo-patrimonio-sagunto'
    }
];

// Función para renderizar los artículos
function renderArticles() {
    const container = document.getElementById('articlesContainer');

    container.innerHTML = articlesData.map(article => `
        <article class="article-item">
            <div class="article-image"></div>
            <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.excerpt}</p>
                <p style="font-size: 12px; color: #999999;">
                    ${article.date} · Por ${article.author}
                </p>
                <a href="article.html?id=${article.id}" class="article-link">Leer más →</a>
            </div>
        </article>
    `).join('');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    renderArticles();
});
