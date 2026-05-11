document.addEventListener('DOMContentLoaded', function() {
    // --- 1. CONFIGURATIE & SELECTOREN ---
    const urlParams = new URLSearchParams(window.location.search);
    const plantId = parseInt(urlParams.get('id'));
    
    // Check op welke pagina we zijn om de redirect-loop te voorkomen
    const isDetailPage = window.location.pathname.includes('plantengidsdetail.html');

    // Als we op de detailpagina zijn maar GEEN id hebben, ga terug naar het overzicht
    if (isDetailPage && !plantId) {
        window.location.href = 'plantengids.html';
        return;
    }

    // Als we NIET op de detailpagina zijn, stop dan dit script volledig
    if (!isDetailPage) return;

    // Selectoren voor de content
    const detailTitle = document.getElementById('detailTitle');
    const breadcrumbPlantName = document.getElementById('breadcrumbPlantName');
    const plantMainImg = document.getElementById('plantMainImg');
    const tabFullDesc = document.getElementById('tabFullDesc');
    const tabReviews = document.getElementById('tabReviews');
    const prevBtn = document.getElementById('prevPlant');
    const nextBtn = document.getElementById('nextPlant');
    const stockEl = document.getElementById('stockStatus');
    const potEl = document.getElementById('potSize');

    fetch('./json/planten.json')
        .then(response => {
            if (!response.ok) throw new Error("JSON bestand niet gevonden");
            return response.json();
        })
        .then(data => {
           
            const currentIndex = data.findIndex(p => p.id === plantId);
            const plant = data[currentIndex];

            if (plant) {
                fillDetailData(plant);
                setupNavigation(data, currentIndex);
            } else {
                console.error("Plant niet gevonden in database.");
            }
        })
        .catch(error => console.error('Fout bij laden detailpagina:', error));

    function fillDetailData(plant) {
        if (detailTitle) detailTitle.innerText = plant.naam;
        if (breadcrumbPlantName) breadcrumbPlantName.innerText = plant.naam;
        if (plantMainImg) plantMainImg.src = plant.afbeelding;

        if (stockEl) {
            stockEl.innerText = plant.status || "In stock";
            if (plant.status && plant.status.toLowerCase() === 'out of stock') {
                stockEl.style.color = '#dc3545';
            } else {
                stockEl.style.color = '#4E9D3A';
            }
        }
        if (potEl) {
            potEl.innerText = plant.potmaat || "25-30 C";
        }
        if (tabFullDesc) {
            tabFullDesc.innerText = plant.beschrijving || "Geen uitgebreide beschrijving beschikbaar.";
        }
        const safeSet = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val || "-";
        };

        safeSet('valFlowerColor', plant.bloemkleur);
        safeSet('valSize', plant.hoogte);
        safeSet('valSun', plant.standplaats);
        safeSet('valSoil', plant.grondsoort);
        safeSet('valHardy', plant.wintergroen === 'ja' ? 'Winterhard' : 'Nee');
        
        if (plant.bloeiperiode) {
            const periodeTekst = Array.isArray(plant.bloeiperiode) 
                ? plant.bloeiperiode.join(' - ') 
                : plant.bloeiperiode;
            safeSet('valPeriod', periodeTekst);
        }
        if (tabReviews) {
            if (plant.reviews && plant.reviews.length > 0) {
                tabReviews.innerHTML = plant.reviews.map(rev => `
                    <div class="c-review-item mb-4 border-bottom pb-3">
                        <div class="d-flex align-items-center mb-2">
                            <div class="c-review-stars me-3">${generateStars(rev.rating)}</div>
                            <strong class="mb-0 text-dark">${rev.user}</strong>
                        </div>
                        <p class="mb-0 text-muted" style="font-size: 14px;">"${rev.comment}"</p>
                    </div>
                `).join('');
            } else {
                tabReviews.innerHTML = `<div class="text-center py-4 text-muted"><p>Nog geen reviews.</p></div>`;
            }
        }
    }
    function setupNavigation(allPlants, currentIndex) {
        // Oneindige loop: terug naar begin als we bij het einde zijn
        const prevIndex = (currentIndex - 1 + allPlants.length) % allPlants.length;
        const nextIndex = (currentIndex + 1) % allPlants.length;

        if (prevBtn) {
            prevBtn.onclick = () => {
                window.location.href = `plantengidsdetail.html?id=${allPlants[prevIndex].id}`;
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                window.location.href = `plantengidsdetail.html?id=${allPlants[nextIndex].id}`;
            };
        }
    }
    function generateStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += (i <= rating) 
                ? '<i class="bi bi-star-fill text-warning me-1"></i>' 
                : '<i class="bi bi-star text-muted me-1"></i>';
        }
        return starsHtml;
    }
});