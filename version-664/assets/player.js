(function () {
  window.initPlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !sourceUrl) {
      return;
    }
    function prepare() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== sourceUrl) {
          video.src = sourceUrl;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsInstance) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        }
      } else if (video.src !== sourceUrl) {
        video.src = sourceUrl;
      }
    }
    function play() {
      prepare();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
