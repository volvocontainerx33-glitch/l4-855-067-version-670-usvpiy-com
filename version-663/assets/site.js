(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing-image");
      });
    });
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var scope = document.querySelector("[data-filter-scope]");
    if (!form || !scope) {
      return;
    }
    var searchInput = form.querySelector("[data-filter-search]");
    var yearSelect = form.querySelector("[data-filter-year]");
    var genreSelect = form.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-filter-empty]");

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.textContent
        ].join(" "));
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          ok = false;
        }
        if (genre && haystack.indexOf(genre) === -1) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [searchInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("[data-video]");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;
      var isLoaded = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setStatus("播放已准备，请再次点击视频区域或使用播放器控件开始播放。");
          });
        }
      }

      function loadSource() {
        if (!video || !source) {
          setStatus("当前影片暂未配置播放源。");
          return;
        }
        if (isLoaded) {
          player.classList.add("is-playing");
          playVideo();
          return;
        }
        isLoaded = true;
        player.classList.add("is-ready");
        setStatus("正在加载高清播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源加载完成。");
            player.classList.add("is-playing");
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请刷新页面后重试。");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源加载完成。");
            player.classList.add("is-playing");
            playVideo();
          }, { once: true });
        } else {
          video.src = source;
          setStatus("当前浏览器可能需要支持 HLS 的播放器环境。");
        }
      }

      if (button) {
        button.addEventListener("click", loadSource);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!isLoaded) {
            loadSource();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-movie-card>",
      "  <a class=\"cover-frame\" href=\"" + escapeHtml(movie.page) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "海报\" loading=\"lazy\">",
      "    <span class=\"card-type\">" + escapeHtml(movie.type) + "</span>",
      "    <span class=\"card-score\">★ " + escapeHtml(movie.rating) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + escapeHtml(movie.page) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.description) + "</p>",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var summary = page.querySelector("[data-search-summary]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var query = normalize(input.value);
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (!query) {
          return movie.hot;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.genre,
          movie.year,
          movie.type,
          movie.tags.join(" "),
          movie.description
        ].join(" ")).indexOf(query) !== -1;
      });
      matches.sort(function (a, b) {
        return b.views - a.views;
      });
      var limited = matches.slice(0, 120);
      summary.textContent = query ? "找到 " + matches.length + " 部相关影片，当前显示前 " + limited.length + " 部。" : "输入关键词可搜索完整片库，默认显示热门影片。";
      results.innerHTML = limited.map(createResultCard).join("\n");
      initImageFallbacks();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextUrl = new URL(window.location.href);
      if (input.value.trim()) {
        nextUrl.searchParams.set("q", input.value.trim());
      } else {
        nextUrl.searchParams.delete("q");
      }
      window.history.replaceState({}, "", nextUrl.toString());
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initImageFallbacks();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
