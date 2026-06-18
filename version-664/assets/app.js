(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function rootPath() {
    return document.body.getAttribute("data-root") || "./";
  }

  function resolveUrl(url) {
    return rootPath() + String(url || "").replace(/^\.\//, "");
  }

  function imageUrl(id) {
    var imageNumber = ((Number(id) - 1) % 150) + 1;
    return rootPath() + imageNumber + ".jpg";
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var search = document.querySelector(".nav-search");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
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
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".js-global-search"));
    var index = window.MOVIE_SEARCH_INDEX || [];
    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var panel = form.querySelector(".search-panel");
      if (!input || !panel) {
        return;
      }
      function render(items) {
        if (!items.length) {
          panel.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = items.slice(0, 8).map(function (item) {
          return '<a class="search-item" href="' + resolveUrl(item.url) + '">' +
            '<img src="' + imageUrl(item.id) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.add("is-open");
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var matched = index.filter(function (item) {
          return [item.title, item.year, item.region, item.genre, item.category].join(" ").toLowerCase().indexOf(query) !== -1;
        });
        render(matched);
      });
      input.addEventListener("focus", function () {
        if (input.value.trim()) {
          input.dispatchEvent(new Event("input"));
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (query) {
          window.location.href = resolveUrl("search.html") + "?q=" + encodeURIComponent(query);
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-target]"));
    inputs.forEach(function (input) {
      var targetId = input.getAttribute("data-filter-target");
      var target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".js-filter-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || card.textContent || "";
          card.style.display = text.toLowerCase().indexOf(query) === -1 ? "none" : "";
        });
      });
    });
  }

  function setupSearchPage() {
    var container = document.getElementById("searchResults");
    if (!container) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var index = window.MOVIE_SEARCH_INDEX || [];
    var title = document.getElementById("searchTitle");
    var items = query ? index.filter(function (item) {
      return [item.title, item.year, item.region, item.genre, item.category].join(" ").toLowerCase().indexOf(query) !== -1;
    }) : index.slice(0, 32);
    if (title) {
      title.textContent = query ? "搜索结果" : "热门浏览";
    }
    if (!items.length) {
      container.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
      return;
    }
    container.innerHTML = items.slice(0, 80).map(function (item) {
      return '<a class="movie-card" href="' + resolveUrl(item.url) + '">' +
        '<div class="poster-frame"><img src="' + imageUrl(item.id) + '" alt="' + escapeHtml(item.title) + '"><span class="poster-badge">' + escapeHtml(item.category) + '</span></div>' +
        '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>' +
        '</a>';
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupFilters();
    setupSearchPage();
  });
})();
