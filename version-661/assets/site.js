(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function() {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        play();
      });
    });
    root.addEventListener("mouseenter", function() {
      clearInterval(timer);
    });
    root.addEventListener("mouseleave", play);
    play();
  }

  function valueOf(form, name) {
    var field = form.querySelector("[name='" + name + "']");
    return field ? field.value.trim().toLowerCase() : "";
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function(form) {
      var target = document.querySelector(form.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      var fields = Array.prototype.slice.call(form.querySelectorAll("input, select"));
      function apply() {
        var q = valueOf(form, "q");
        var category = valueOf(form, "category");
        var region = valueOf(form, "region");
        var year = valueOf(form, "year");
        cards.forEach(function(card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (category && (card.getAttribute("data-category") || "").toLowerCase() !== category) {
            ok = false;
          }
          if (region && (card.getAttribute("data-region") || "").toLowerCase() !== region) {
            ok = false;
          }
          if (year && (card.getAttribute("data-year") || "").toLowerCase() !== year) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }
      fields.forEach(function(field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });
      var clear = form.querySelector("[data-clear-filter]");
      if (clear) {
        clear.addEventListener("click", function() {
          fields.forEach(function(field) {
            field.value = "";
          });
          apply();
        });
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      var input = form.querySelector("input[name='q']");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "./search.html";
        window.location.href = q ? action + "?q=" + encodeURIComponent(q) : action;
      });
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initSearchForms();
  });
}());
