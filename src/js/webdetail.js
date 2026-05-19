document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Webshop detail script gestart");

    const urlParams = new URLSearchParams(window.location.search);
    const plantNaam = urlParams.get('plant'); 
    console.log("🏷️ Gevonden plantnaam in URL Parameters:", plantNaam);
    
    const currentPath = window.location.pathname.toLowerCase();
    const isWebshopDetailPage = currentPath.includes('webshop') && currentPath.includes('detail');
    console.log("📄 Is dit de juiste webshop-detail pagina?:", isWebshopDetailPage);

    if (!isWebshopDetailPage) {
        console.warn("⚠️ Script gestopt: Dit is niet de webshop detailpagina.");
        return;
    }
    if (!plantNaam) {
        console.error("❌ Script gestopt: Er is geen 'plant' parameter meegegeven in de URL (?plant=...)");
        return;
    }


    let huidigePlant = null;

    const detailTitle = document.getElementById('detailTitle');
    const breadcrumbPlantName = document.getElementById('breadcrumbPlantName');
    const plantMainImg = document.getElementById('plantMainImg');
    const thumbContainer = document.getElementById('thumbContainer');
    const detailPrice = document.querySelector('.c-detail-price');
    const detailReviewStars = document.getElementById('detailReviewStars');
    const tabDescText = document.getElementById('tabDescText');
    const reviewContent = document.getElementById('reviewContent');
    const stockEl = document.getElementById('stockStatus');
    const potEl = document.getElementById('potSize');


    console.log("🌐 JSON data aan het ophalen via fetch...");
    fetch('./json/planten.json')
        .then(response => {
            if (!response.ok) throw new Error("JSON bestand kon niet worden geladen.");
            return response.json();
        })
        .then(data => {
            console.log(`📦 JSON database geladen. Totaal aantal producten: ${data.length}`);
            
            const plant = data.find(p => p.naam.trim() === plantNaam.trim());

            if (plant) {
                console.log("🎯 Plant succesvol gematcht in database!");
                huidigePlant = plant;
                fillWebshopDetailData(plant);
            } else {
                console.error(`❌ Fout: Geen product gevonden in de JSON met de naam: ${plantNaam}`);
            }
        })
        .catch(error => console.error('❌ Kritieke fout bij het inladen van de webshop details:', error));

    function fillWebshopDetailData(plant) {
        console.log("✍️ Pagina vullen met productgegevens...");

        if (detailTitle) detailTitle.innerText = plant.naam;
        if (breadcrumbPlantName) breadcrumbPlantName.innerText = plant.naam;
        if (plantMainImg) {
            plantMainImg.src = plant.afbeelding;
            plantMainImg.alt = plant.naam;
        }

        if (stockEl) {
            stockEl.innerText = plant.voorraad_status || (plant.status === 'out of stock' ? 'Niet op voorraad' : 'Op voorraad');
            stockEl.className = (plant.status === 'out of stock') ? 'badge bg-danger' : 'badge bg-success';
        }
        if (potEl) potEl.innerText = plant.potmaat || "C2 (2 liter pot)";

        const bTekst = plant.beschrijving_lang || plant.beschrijving || "Geen beschrijving beschikbaar.";
        if (document.getElementById('detailDesc')) {
            document.getElementById('detailDesc').innerText = plant.beschrijving_kort || `${plant.naam} is een uitstekende keuze voor uw tuin.`;
        }
        if (tabDescText) tabDescText.innerText = bTekst;

        const safeSet = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val || "-";
        };
        safeSet('valFlowerColor', plant.bloemkleur);
        safeSet('valSize', plant.hoogte);
        safeSet('valSun', plant.standplaats);
        safeSet('valHardy', plant.winterhard || (plant.wintergroen === 'ja' ? 'Ja' : 'Nee'));

        if (thumbContainer) {
            const photos = [plant.afbeelding, ...(plant.extra_fotos || [])];
            thumbContainer.innerHTML = photos.map((imgSrc, index) => `
                <div class="col-4">
                    <img src="${imgSrc}" 
                         class="img-fluid rounded shadow-sm ${index === 0 ? '' : 'opacity-75'} c-thumb-nail" 
                         style="cursor:pointer; object-fit: cover; height: 80px; width: 100%;" 
                         alt="Thumbnail ${index}">
                </div>
            `).join('');

            thumbContainer.querySelectorAll('.c-thumb-nail').forEach(thumb => {
                thumb.onclick = function() {
                    plantMainImg.src = this.src;
                    thumbContainer.querySelectorAll('.c-thumb-nail').forEach(t => t.classList.add('opacity-75'));
                    this.classList.remove('opacity-75');
                };
            });
        }

        if (detailReviewStars) {
            const avgRating = calculateAverageRating(plant.reviews);
            detailReviewStars.innerHTML = generateStars(avgRating) + 
                `<span class="text-muted small ms-1">(${plant.reviews ? plant.reviews.length : 0} reviews)</span>`;
        }

        if (reviewContent) {
            if (plant.reviews && plant.reviews.length > 0) {
                reviewContent.innerHTML = plant.reviews.map(rev => `
                    <div class="mb-3 border-bottom pb-2">
                        <div class="d-flex align-items-center mb-1">
                            <div class="me-2">${generateStars(rev.rating)}</div>
                            <strong class="small">${rev.user || rev.auteur || 'Anoniem'}</strong>
                        </div>
                        <p class="text-muted small mb-0">"${rev.comment || rev.tekst || ''}"</p>
                    </div>
                `).join('');
            }
        }
        
        herberekenPrijs(1);
        
        console.log("✨ Pagina succesvol opgebouwd!");
    }

    function herberekenPrijs(aantal) {
        if (!huidigePlant) return;

        const detailPrice = document.querySelector('.c-detail-price');
        if (!detailPrice) return;

        let prijsPerStuk = huidigePlant.prijs;

        if (huidigePlant.staffel) {
            if (aantal >= 100 && huidigePlant.staffel["100"]) {
                prijsPerStuk = huidigePlant.staffel["100"];
            } else if (aantal >= 10 && huidigePlant.staffel["10"]) {
                prijsPerStuk = huidigePlant.staffel["10"];
            } else if (huidigePlant.staffel["1"]) {
                prijsPerStuk = huidigePlant.staffel["1"];
            }
        }

        detailPrice.innerHTML = `€ ${prijsPerStuk.toFixed(2).replace('.', ',')} <span class="text-muted small fw-normal ms-1">(per stuk)</span>`;

        updateSnelkeuzeKnoppenStaat(aantal);
    }

    window.setQuickQty = function(aantal) {
        const input = document.getElementById('detailQty');
        if (input) {
            input.value = aantal;
            herberekenPrijs(aantal);
        }
    };

    window.updateQty = function(btn, change) {
        const input = btn.parentElement.querySelector('.qty-input');
        if (!input) return;

        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        
        input.value = val;
        herberekenPrijs(val);
    };

    function updateSnelkeuzeKnoppenStaat(aantal) {
        const buttons = document.querySelectorAll('.c-quick-qty-btns button');
        buttons.forEach(btn => btn.classList.remove('btn-primary', 'text-white', 'active'));

        if (aantal === 1) {
            buttons[0]?.classList.add('active');
        } else if (aantal === 10) {
            buttons[1]?.classList.add('active');
        } else if (aantal === 100) {
            buttons[2]?.classList.add('active');
        }
    }

    function generateStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                starsHtml += '<i class="bi bi-star-half text-warning"></i>';
            } else {
                starsHtml += '<i class="bi bi-star text-muted"></i>';
            }
        }
        return starsHtml;
    }

    function calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        return total / reviews.length;
    }
});