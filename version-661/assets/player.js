(function() {
  window.initMoviePlayer = function(src) {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !src) {
      return;
    }
    var loaded = false;
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    }
    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function() {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  };
}());
