(function () {
  var header = document.querySelector('.site-header');
  var topButton = document.querySelector('[data-to-top]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncChrome() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 24);
    }
    if (topButton) {
      topButton.classList.toggle('show', window.scrollY > 420);
    }
  }

  window.addEventListener('scroll', syncChrome, { passive: true });
  syncChrome();

  if (topButton) {
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    stopHero();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applySearch(value) {
    var term = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-filtered-out', term && text.indexOf(term) === -1);
    });
    inputs.forEach(function (input) {
      if (input.value !== value) {
        input.value = value;
      }
    });
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applySearch(input.value);
    });
  });

  var video = document.querySelector('[data-player]');
  var startButton = document.querySelector('[data-player-start]');
  var stream = window.__STREAM_URL__;
  var hlsInstance = null;
  var started = false;

  function prepareVideo() {
    if (!video || !stream || started) {
      return;
    }
    started = true;
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function playVideo() {
    if (!video) {
      return;
    }
    prepareVideo();
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
