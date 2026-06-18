(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        activateHero(current + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activateHero(index);
      startHero();
    });
  });

  activateHero(0);
  startHero();

  var searchInput = document.querySelector('.movie-search');
  var yearFilter = document.querySelector('.year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function filterCards() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();

      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden-by-filter', !(matchedQuery && matchedYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
})();
