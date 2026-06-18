(function () {
  window.initMoviePlayer = function (id, src) {
    var box = document.getElementById(id);

    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var hlsInstance = null;
    var ready = false;

    function attach() {
      if (!video || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
