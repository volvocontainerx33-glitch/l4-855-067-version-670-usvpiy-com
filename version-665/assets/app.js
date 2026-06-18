(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var list = document.querySelector("[data-card-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var empty = document.createElement("div");
        empty.className = "no-match";
        empty.textContent = "没有找到匹配的影片";

        input.addEventListener("input", function () {
            var q = input.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-text") || "")).toLowerCase();
                var matched = !q || text.indexOf(q) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });
            if (!shown && !empty.parentNode) {
                list.appendChild(empty);
            }
            if (shown && empty.parentNode) {
                empty.parentNode.removeChild(empty);
            }
        });
    }

    function initPlayers() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        blocks.forEach(function (block) {
            var video = block.querySelector("video");
            var button = block.querySelector(".play-overlay");
            var stream = block.getAttribute("data-stream");
            var hls = null;

            if (!video || !button || !stream) {
                return;
            }

            function attach() {
                if (block.getAttribute("data-ready") === "1") {
                    return;
                }
                block.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.addEventListener("ended", function () {
                    if (hls && typeof hls.stopLoad === "function") {
                        hls.stopLoad();
                    }
                });
            }

            function play() {
                attach();
                button.classList.add("hidden");
                var task = video.play();
                if (task && typeof task.catch === "function") {
                    task.catch(function () {
                        button.classList.remove("hidden");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });
}());
