// Mejora progresiva del índice: filtro por categoría + buscador.
// El contenido ya viene renderizado por PHP; esto solo lo filtra en cliente.
document.addEventListener('DOMContentLoaded', function () {
    const cards = Array.from(document.querySelectorAll('.post-card'));
    const catButtons = Array.from(document.querySelectorAll('.cat-item'));
    const searchInput = document.getElementById('searchInput');
    const container = document.getElementById('articlesContainer');

    let activeCategory = null;
    let searchTerm = '';

    function apply() {
        const q = searchTerm.toLowerCase();
        let visible = 0;
        cards.forEach(card => {
            const cat = card.dataset.category || '';
            const title = card.dataset.title || '';
            const excerpt = (card.querySelector('.post-card-excerpt')?.textContent || '').toLowerCase();
            const matchCat = !activeCategory || cat === activeCategory;
            const matchSearch = !q || title.includes(q) || excerpt.includes(q) || cat.toLowerCase().includes(q);
            const show = matchCat && matchSearch;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        let empty = container.querySelector('.empty-state');
        if (visible === 0) {
            if (!empty) {
                empty = document.createElement('p');
                empty.className = 'empty-state';
                empty.textContent = 'No hay artículos que coincidan con tu búsqueda.';
                container.appendChild(empty);
            }
        } else if (empty) {
            empty.remove();
        }
    }

    catButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;
            if (category === 'all' || activeCategory === category) {
                activeCategory = null;
            } else {
                activeCategory = category;
            }
            catButtons.forEach(b => b.classList.toggle('cat-active',
                (activeCategory === null && b.dataset.category === 'all') ||
                b.dataset.category === activeCategory));
            apply();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            searchTerm = this.value.trim();
            apply();
        });
    }
});
