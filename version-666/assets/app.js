(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupHeader() {
    var header = one('[data-header]');
    var toggle = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');
    var sync = function () {
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 12);
      }
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }
  }

  function setupHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]', slider);
    var index = 0;
    var timer;
    function go(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        go(i);
        start();
      });
    });
    start();
  }

  function setupSearch() {
    var input = one('[data-search]');
    var cards = all('[data-card]');
    var filters = all('[data-filter]');
    var activeFilter = 'all';
    if (!input || !cards.length) {
      return;
    }
    function content(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }
    function apply() {
      var term = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var hay = content(card);
        var okTerm = !term || hay.indexOf(term) !== -1;
        var okFilter = activeFilter === 'all' || hay.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(okTerm && okFilter));
      });
    }
    input.addEventListener('input', apply);
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        filters.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        apply();
      });
    });
  }

  window.createPlayer = function (streamUrl) {
    var video = one('[data-video]');
    var cover = one('[data-play-cover]');
    var hlsInstance = null;
    var ready = false;
    if (!video) {
      return;
    }
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupHeader();
    setupHero();
    setupSearch();
  });
})();
