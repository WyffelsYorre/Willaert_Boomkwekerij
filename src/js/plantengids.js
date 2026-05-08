document.addEventListener('DOMContentLoaded', function() {
    let allePlanten = [];
    let huidigeGefilterdeLijst = []; 
    let zichtbarePlantenCount = 9;

    const plantGrid = document.getElementById('plantGrid');
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const clearAllBtn = document.querySelector('.btn-clear-all');
    const catSearchInput = document.getElementById('catSearch');
    const headerSearch = document.getElementById('headerSearch');
    const heroSearchForm = document.getElementById('heroSearchForm');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const countElement = document.getElementById('plant-count');

    const sidebar = document.getElementById('sidebarScroll');
    const indicator = document.getElementById('scrollIndicator');
    const activeFiltersContainer = document.querySelector('.c-pg-active-filters');

    fetch('./json/planten.json')
        .then(response => {
            if (!response.ok) throw new Error("JSON bestand niet gevonden");
            return response.json();
        })
        .then(data => {
            allePlanten = data;
            updateFilters();
        })
        .catch(error => {
            console.error('Fout bij laden JSON:', error);
            if(plantGrid) plantGrid.innerHTML = '<p class="text-danger">Kon de planten niet laden.</p>';
        });

    function renderPlanten(plantenLijst) {
        if (!plantGrid) return;
        plantGrid.innerHTML = ''; 
        huidigeGefilterdeLijst = plantenLijst;

        if (countElement) {
            countElement.innerText = plantenLijst.length;
        }

        if (plantenLijst.length === 0) {
            plantGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Geen planten gevonden die aan deze criteria voldoen.</p></div>';
            if (loadMoreBtn) loadMoreBtn.classList.add('d-none');
            return;
        }

        const teTonenPlanten = plantenLijst.slice(0, zichtbarePlantenCount);

        teTonenPlanten.forEach(plant => {
            const card = `
                <div class="col-md-4">
                    <div class="c-plant-card">
                        <div class="c-plant-card__wrapper">
                            <img src="${plant.afbeelding}" alt="${plant.naam}" class="c-plant-card__img">
                            <div class="c-plant-card__overlay">
                                <div class="c-plant-card__info">
                                    <h3 class="c-plant-card__title">${plant.naam}</h3>
                                    <p class="c-plant-card__genus text-uppercase">${plant.genus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            plantGrid.insertAdjacentHTML('beforeend', card);
        });

        if (loadMoreBtn) {
            if (plantenLijst.length > zichtbarePlantenCount) {
                loadMoreBtn.classList.remove('d-none');
            } else {
                loadMoreBtn.classList.add('d-none');
            }
        }
    }

    function updateFilters() {
        zichtbarePlantenCount = 9;
        
        const filters = {};
        const activeBadges = [];
        const searchTerm = headerSearch ? headerSearch.value.toLowerCase() : "";
        
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const group = cb.getAttribute('data-group'); 
                const value = cb.getAttribute('data-filter') || cb.nextElementSibling.innerText.split('(')[0].trim().toLowerCase();

                if (!filters[group]) filters[group] = [];
                filters[group].push(value);

                const label = cb.nextElementSibling.innerText.split('(')[0].trim();
                activeBadges.push({ group, val: value, label });
            }
        });

        const gefilterdeLijst = allePlanten.filter(plant => {
            const matchesSearch = plant.naam.toLowerCase().includes(searchTerm) || 
                                  plant.genus.toLowerCase().includes(searchTerm);

            if (!matchesSearch) return false;

            return Object.keys(filters).every(group => {
                const geselecteerdeWaardes = filters[group];
                const plantData = plant[group];

                if (!plantData) return false;

                if (Array.isArray(plantData)) {
                    const plantDataLower = plantData.map(i => i.toLowerCase());
                    return geselecteerdeWaardes.some(v => plantDataLower.includes(v));
                } else {
                    return geselecteerdeWaardes.includes(plantData.toLowerCase());
                }
            });
        });

        renderPlanten(gefilterdeLijst);
        renderBadges(activeBadges);
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            zichtbarePlantenCount += 9;
            renderPlanten(huidigeGefilterdeLijst);
        });
    }

    function renderBadges(activeBadges) {
        if (!activeFiltersContainer) return;
        const oldBadges = activeFiltersContainer.querySelectorAll('.c-pg-filter-badge');
        oldBadges.forEach(b => b.remove());

        activeBadges.forEach(badgeObj => {
            const badge = document.createElement('span');
            badge.className = 'badge c-pg-filter-badge';
            badge.innerHTML = `${badgeObj.label} <i class="bi bi-x-lg ms-2" style="cursor:pointer"></i>`;
            
            badge.querySelector('i').addEventListener('click', () => {
                const cb = Array.from(checkboxes).find(c => {
                    const val = c.getAttribute('data-filter') || c.nextElementSibling.innerText.split('(')[0].trim().toLowerCase();
                    return val === badgeObj.val && c.getAttribute('data-group') === badgeObj.group;
                });
                if (cb) {
                    cb.checked = false;
                    updateFilters();
                }
            });

            activeFiltersContainer.insertBefore(badge, clearAllBtn);
        });
    }

    if (headerSearch) {
        headerSearch.addEventListener('input', updateFilters);
    }

    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateFilters();
        });
    }

    if (catSearchInput) {
        catSearchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const catList = document.getElementById('catList');
            const pills = catList.querySelectorAll('.c-filter-pill');
            const moreContent = document.getElementById('moreCats');
            const showMoreBtn = document.querySelector('[data-bs-target="#moreCats"]');

            if (searchValue.length > 0) {
                if (moreContent) moreContent.classList.add('show');
                if (showMoreBtn) showMoreBtn.style.display = 'none';
            } else {
                if (moreContent) moreContent.classList.remove('show');
                if (showMoreBtn) showMoreBtn.style.display = 'block';
            }

            pills.forEach(pill => {
                const text = pill.textContent.toLowerCase();
                pill.style.display = text.includes(searchValue) ? 'block' : 'none';
            });
        });
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updateFilters));

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkboxes.forEach(cb => cb.checked = false);
            if (headerSearch) headerSearch.value = "";
            updateFilters();
        });
    }

    const collapseElements = document.querySelectorAll('.collapse');
    collapseElements.forEach(collapse => {
        const btn = document.querySelector(`[data-bs-target="#${collapse.id}"]`);
        if (!btn) return;
        collapse.addEventListener('show.bs.collapse', () => {
            if(btn.classList.contains('btn-show-more')) {
                btn.setAttribute('data-original-text', btn.innerText);
                btn.innerText = '- Toon minder';
            }
        });
        collapse.addEventListener('hide.bs.collapse', () => {
            if(btn.classList.contains('btn-show-more')) {
                btn.innerText = btn.getAttribute('data-original-text') || '+ Toon meer';
            }
        });
    });

    if (sidebar && indicator) {
        const checkScroll = () => {
            const isAtBottom = sidebar.scrollHeight - sidebar.scrollTop <= sidebar.clientHeight + 15;
            if (isAtBottom) indicator.classList.add('is-hidden');
            else indicator.classList.remove('is-hidden');
        };
        sidebar.addEventListener('scroll', checkScroll);
        window.addEventListener('load', () => {
            if (sidebar.scrollHeight <= sidebar.clientHeight) indicator.style.display = 'none';
            else checkScroll();
        });
    }
});