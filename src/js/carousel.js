document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.c-carousel-section__track');
    const items = document.querySelectorAll('.c-carousel-section__item');
    if (!track || items.length === 0) return;

    const GAP = 60;
    const WIDTH_SIDE = 320;
    const WIDTH_ACTIVE = 750;
    
    let currentIndex = 3;

    window.moveTo = function(index) {
        if (window.innerWidth <= 991) return;

        if (index < 0 || index >= items.length) return;
        currentIndex = index;

        items.forEach((item, i) => {
            item.classList.toggle('is-active', i === index);
        });

        const totalWidthBefore = index * (WIDTH_SIDE + GAP);

        const activeItemCenter = totalWidthBefore + (WIDTH_ACTIVE / 2);

        const viewportCenter = window.innerWidth / 2;

        const targetX = viewportCenter - activeItemCenter;

        track.style.transform = `translateX(${targetX}px)`;
    };

    items.forEach((item, index) => {
        item.addEventListener('click', () => moveTo(index));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            moveTo(currentIndex);
        } else {
            track.style.transform = 'none';
        }
    });
    
    setTimeout(() => {
        if (window.innerWidth > 991) moveTo(currentIndex);
    }, 100);
});