(function () {
  function selectAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initNavigation() {
    var nav = select('[data-site-nav]');
    var toggle = select('[data-nav-toggle]');
    var menu = select('[data-nav-menu]');

    if (!nav) {
      return;
    }

    function updateNavState() {
      if (window.scrollY > 16) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });

      selectAll('a', menu).forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('is-open');
        });
      });
    }
  }

  function initHero() {
    var hero = select('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        setSlide((index + 1) % slides.length);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
        restart();
      });
    });

    setSlide(0);
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initSearchAndFilters() {
    var input = select('[data-search-input]');
    var cards = selectAll('[data-movie-card]');
    var resultCount = select('[data-result-count]');
    var emptyState = select('[data-empty-state]');
    var filterButtons = selectAll('[data-filter-value]');
    var activeFilter = '全部';

    if (!cards.length) {
      return;
    }

    var queryFromUrl = getQueryValue('q');
    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-filter-text'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
        var matchesFilter = activeFilter === '全部' || card.getAttribute('data-genre') === activeFilter || (card.getAttribute('data-filter-text') || '').indexOf(activeFilter) !== -1;
        var visible = matchesQuery && matchesFilter;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '共 ' + visibleCount + ' 部内容';
      }

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter-value') || '全部';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  function initRankTabs() {
    var tabs = selectAll('[data-rank-tab]');
    var panels = selectAll('[data-rank-panel]');

    if (!tabs.length || !panels.length) {
      return;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-rank-tab');
        tabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-rank-panel') === key);
        });
      });
    });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = select('video', player);
      var button = select('[data-player-button]', player);
      var message = select('[data-player-message]', player);
      var source = player.getAttribute('data-src');
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放器开始播放。');
          });
        }
      }

      function initializeHls() {
        if (player.getAttribute('data-ready') === 'true') {
          playVideo();
          return;
        }

        player.setAttribute('data-ready', 'true');
        button.classList.add('is-hidden');
        setMessage('正在初始化高清播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请稍后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            playVideo();
          }, { once: true });
          video.load();
          return;
        }

        video.src = source;
        video.load();
        setMessage('当前浏览器未加载 HLS.js，已尝试直接播放 m3u8。');
        playVideo();
      }

      button.addEventListener('click', initializeHls);
      video.addEventListener('click', function () {
        if (player.getAttribute('data-ready') !== 'true') {
          initializeHls();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearchAndFilters();
    initRankTabs();
    initPlayers();
  });
})();
