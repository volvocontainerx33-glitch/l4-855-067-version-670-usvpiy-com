(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (activeIndex < 0) {
      activeIndex = 0;
    }

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5600);
    }

    document.querySelectorAll("[data-card-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");

      function filterCards() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || "",
            card.dataset.region || "",
            card.dataset.type || "",
            card.dataset.genre || ""
          ].join(" ").toLowerCase();

          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !year || card.dataset.year === year;
          var okType = !type || card.dataset.type === type;

          if (okKeyword && okYear && okType) {
            card.style.display = "";
            shown += 1;
          } else {
            card.style.display = "none";
          }
        });

        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });
    });

    function startPlayer(player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var mediaUrl = player.getAttribute("data-src");

      if (!video || !mediaUrl) {
        return;
      }

      if (!video.dataset.ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }

        video.dataset.ready = "true";
      }

      player.classList.add("is-playing");

      if (overlay) {
        overlay.setAttribute("aria-hidden", "true");
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    document.querySelectorAll(".js-player").forEach(function (player) {
      var overlay = player.querySelector(".play-overlay");
      var video = player.querySelector("video");

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayer(player);
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!video.dataset.ready) {
            startPlayer(player);
          }
        });
      }
    });
  });
})();
