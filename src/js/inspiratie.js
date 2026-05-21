document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll("#inspirationFilters .c-inspiration__btn");
    const cards = document.querySelectorAll("#inspirationGrid .c-inspiration-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // 1. Verwijder actieve klasse van alle knoppen en voeg toe aan de geklikte knop
            filterButtons.forEach(btn => btn.classList.remove("c-inspiration__btn--active"));
            button.classList.add("c-inspiration__btn--active");

            const filterValue = button.getAttribute("data-filter");

            // 2. Filter de kaarten
            cards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");

                if (filterValue === "all" || cardCategory === filterValue) {
                    // Toon de kaart (Bootstrap d-block zet het weer aan)
                    card.style.display = "block";
                } else {
                    // Verberg de kaart
                    card.style.display = "none";
                }
            });
        });
    });
});