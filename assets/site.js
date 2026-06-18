(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
                const bar = dot.querySelector('span');
                if (bar) {
                    bar.style.transition = 'none';
                    bar.style.width = '0';
                    if (dotIndex === active) {
                        window.requestAnimationFrame(function () {
                            bar.style.transition = 'width 5s linear';
                            bar.style.width = '100%';
                        });
                    }
                }
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (slides.length > 0) {
            show(0);
            start();
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const search = scope.querySelector('[data-filter-search]');
        const year = scope.querySelector('[data-filter-year]');
        const region = scope.querySelector('[data-filter-region]');
        const genre = scope.querySelector('[data-filter-genre]');
        const cards = Array.from(scope.querySelectorAll('.js-filter-item'));
        const empty = scope.querySelector('.empty-state');

        function check(card, term, yearValue, regionValue, genreValue) {
            const haystack = [
                card.dataset.title || '',
                card.dataset.tags || '',
                card.dataset.region || '',
                card.dataset.genre || '',
                card.dataset.year || ''
            ].join(' ').toLowerCase();
            const matchesTerm = !term || haystack.includes(term);
            const matchesYear = !yearValue || card.dataset.year === yearValue;
            const matchesRegion = !regionValue || card.dataset.region === regionValue;
            const matchesGenre = !genreValue || (card.dataset.genre || '').includes(genreValue) || (card.dataset.tags || '').includes(genreValue);
            return matchesTerm && matchesYear && matchesRegion && matchesGenre;
        }

        function apply() {
            const term = search ? search.value.trim().toLowerCase() : '';
            const yearValue = year ? year.value : '';
            const regionValue = region ? region.value : '';
            const genreValue = genre ? genre.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const ok = check(card, term, yearValue, regionValue, genreValue);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        [search, year, region, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();
