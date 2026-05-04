document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.c-carousel-section__track');
    const items = document.querySelectorAll('.c-carousel-section__item');
    
    // Stop als de track niet aanwezig is (bijv. op mobiel door display: none)
    if (!track || items.length === 0) return;

    // Harde waardes uit SCSS voor de berekening
    const GAP = 60;
    const WIDTH_SIDE = 320;
    const WIDTH_ACTIVE = 750;
    
    let currentIndex = 3; // Start bij afbeelding 4

    window.moveTo = function(index) {
        // Controleer of we op een scherm zitten waar de carrousel verborgen is
        if (window.innerWidth <= 991) return;

        if (index < 0 || index >= items.length) return;
        currentIndex = index;

        // 1. Update actieve klasse
        items.forEach((item, i) => {
            item.classList.toggle('is-active', i === index);
        });

        // 2. De Berekening
        // Totale breedte van alle items vóór de actieve slide
        const totalWidthBefore = index * (WIDTH_SIDE + GAP);
        
        // Het middelpunt van de actieve slide (nu 750px breed)
        const activeItemCenter = totalWidthBefore + (WIDTH_ACTIVE / 2);
        
        // Het middelpunt van de huidige viewport
        const viewportCenter = window.innerWidth / 2;
        
        // Bereken de transform (Midden scherm - midden item)
        const targetX = viewportCenter - activeItemCenter;

        track.style.transform = `translateX(${targetX}px)`;
    };

    // Click Listeners
    items.forEach((item, index) => {
        item.addEventListener('click', () => moveTo(index));
    });

    // Resize handler
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            moveTo(currentIndex);
        } else {
            // Reset transform als hij verborgen is
            track.style.transform = 'none';
        }
    });
    
    // Initialisatie (kleine delay voor rendering)
    setTimeout(() => {
        if (window.innerWidth > 991) moveTo(currentIndex);
    }, 100);
});