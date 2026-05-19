document.addEventListener('DOMContentLoaded', function() {
    const shopGrid = document.getElementById('shopGrid');
    const badgeList = document.getElementById('activeFiltersList');
    const countElement = document.getElementById('plant-count');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const clearAllBtn = document.getElementById('clearAllFilters');
    
    const descSearch = document.getElementById('descSearch');
    const sizeSearch = document.getElementById('sizeSearch');
    const shopSearchForm = document.getElementById('shopSearchForm');
    let alleProducten = [];
    let gefilterdeLijst = [];
    let zichtbareCount = 6;

    fetch('./json/planten.json')
        .then(res => res.json())
        .then(data => {
            alleProducten = data;
            gefilterdeLijst = [...alleProducten];
            updateFilters();
        })
        .catch(err => console.error("Fout bij laden data:", err));

    function updateFilters() {
        if (badgeList) badgeList.innerHTML = '';
        
        const descTerm = descSearch ? descSearch.value.toLowerCase() : "";
        const sizeTerm = sizeSearch ? sizeSearch.value.toLowerCase() : "";
        
        const checkedBoxes = document.querySelectorAll('.filter-checkbox:checked');
        const activeCats = document.querySelectorAll('.c-cat-filter.active');

        const toegevoegdeLabels = new Set();
        const selectedFilters = {};

        const alleActieveElementen = [...checkedBoxes, ...activeCats];

        alleActieveElementen.forEach(el => {
            const group = el.getAttribute('data-group') || 'rubriek';
            
            const label = el.classList.contains('filter-checkbox') 
                          ? el.nextElementSibling?.innerText.trim() 
                          : el.innerText.trim();
            
            const val = el.getAttribute('data-filter') || label.toLowerCase();

            if (!selectedFilters[group]) selectedFilters[group] = [];
            selectedFilters[group].push(val);

            if (label && !toegevoegdeLabels.has(label)) {
                createBadge(label, el);
                toegevoegdeLabels.add(label);
            }
        });

        gefilterdeLijst = alleProducten.filter(p => {
            const mDesc = p.naam.toLowerCase().includes(descTerm);
            const mSize = p.potmaat ? p.potmaat.toLowerCase().includes(sizeTerm) : true;
            
            const mChecks = Object.keys(selectedFilters).every(group => {
                const values = selectedFilters[group];
                if (values.includes('alle')) return true;
                return p[group] && values.includes(p[group].toLowerCase());
            });

            return mDesc && mSize && mChecks;
        });

        zichtbareCount = 6;
        renderProducts();

        if (clearAllBtn) {
            const hasFilters = alleActieveElementen.length > 0 || descTerm !== "" || sizeTerm !== "";
            clearAllBtn.style.opacity = hasFilters ? "1" : "0.5";
            clearAllBtn.style.pointerEvents = hasFilters ? "auto" : "none";
        }
    }

    function createBadge(text, originalEl) {
        const badge = document.createElement('span');
        badge.className = 'badge c-pg-filter-badge d-flex align-items-center gap-2';
        badge.innerHTML = `${text} <i class="bi bi-x-lg c-webshop-remove" style="cursor:pointer;"></i>`;
        
        badge.querySelector('i').onclick = function(e) {
            e.stopPropagation();
            if (originalEl.classList.contains('filter-checkbox')) {
                originalEl.checked = false;
            } else {
                originalEl.classList.remove('active');
            }
            updateFilters();
        };
        badgeList.appendChild(badge);
    }

    function renderProducts() {
        if (!shopGrid) return;
        shopGrid.innerHTML = '';
        if (countElement) countElement.innerText = gefilterdeLijst.length;

        const itemsToRender = gefilterdeLijst.slice(0, zichtbareCount);

        if (itemsToRender.length === 0) {
            shopGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Geen producten gevonden.</p></div>';
        }

        itemsToRender.forEach(item => {
    const detailURL = `webshopdetail.html?plant=${encodeURIComponent(item.naam)}`;

    const card = `
        <div class="col-md-4 mb-4">
            <div class="c-plant-card c-shop-card">
                <div class="c-shop-card__price-tag">€ ${item.prijs || '5,84'}</div>
                <div class="c-plant-card__wrapper">
                    <a href="${detailURL}">
                        <img src="${item.afbeelding}" class="c-plant-card__img" alt="${item.naam}">
                    </a>
                    
                    <div class="c-plant-card__overlay">
                        <div class="c-plant-card__info text-center">
                            <a href="${detailURL}" class="text-decoration-none">
                                <h3 class="c-plant-card__title text-white small fw-bold mb-1">${item.naam}</h3>
                            </a>
                            
                            <p class="c-plant-card__genus text-white extra-small mb-2">${item.potmaat || '25-30 C'}</p>
                            
                            <div class="d-flex align-items-center justify-content-center gap-2">
                                <div class="c-qty-group">
                                    <button class="qty-btn" onclick="updateQty(this, -1)">-</button>
                                    <input type="number" value="1" class="qty-input" readonly>
                                    <button class="qty-btn" onclick="updateQty(this, 1)">+</button>
                                </div>
                                <button class="c-btn-cart-add" onclick="addToCart('${item.naam}')">
                                    <i class="bi bi-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    shopGrid.insertAdjacentHTML('beforeend', card);
});

        if (loadMoreBtn) {
            gefilterdeLijst.length > zichtbareCount ? loadMoreBtn.classList.remove('d-none') : loadMoreBtn.classList.add('d-none');
        }
    }

    document.querySelectorAll('.c-cat-filter').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
            updateFilters();
        });
    });

    document.body.addEventListener('change', e => {
        if (e.target.classList.contains('filter-checkbox')) updateFilters();
    });

    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            zichtbareCount += 6;
            renderProducts();
        };
    }

    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            document.querySelectorAll('.filter-checkbox').forEach(c => c.checked = false);
            document.querySelectorAll('.c-cat-filter').forEach(c => c.classList.remove('active'));
            if (descSearch) descSearch.value = '';
            if (sizeSearch) sizeSearch.value = '';
            updateFilters();
        };
    }

    if (shopSearchForm) {
        shopSearchForm.onsubmit = e => {
            e.preventDefault();
            updateFilters();
        };
    }

    window.updateQty = (btn, change) => {
        const input = btn.parentElement.querySelector('.qty-input');
        let val = parseInt(input.value) + change;
        input.value = val < 1 ? 1 : val;
    };

    window.addToCart = (naam) => {
        alert(`${naam} is toegevoegd aan je winkelmandje!`);
    };
});