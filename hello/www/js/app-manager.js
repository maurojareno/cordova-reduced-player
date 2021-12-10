var AppManager = function (config) {
  var self = this;

  /**
   * Process playlist.
   */
  self.processPlaylist = function () {
    var playlist = config.playlist;

    // If the playlist has only 1 video, we duplicate it to make loop
    if (playlist.length == 2) {
      playlist.push(playlist[0]);
      playlist.push(playlist[1]);
      console.log(playlist);
    }

    for (var i = 0; i < playlist.length; i++) {
      var element = playlist[i];

      if (element.source.indexOf("json") !== -1) {
        // Media config
        $.getJSON(element.source, function (data) {
          self.mediaConfigs.push(data);
          if (!self.ready) {
            console.log("READY TO PLAY");
            self.ready = true;
            self.play();
          }
        });
      } else {
        // Append only first video
        var shouldAppend = self.medias.length === 0;
        var videoId = "video_" + self.medias.length;

        self.mediaSources.push(element.source);
        self.medias.push(videoId);

        if (shouldAppend) {
          var videoEl = document.createElement("video");
          var $video = $(videoEl);

          videoEl.id = videoId;
          videoEl.src = element.source;
          videoEl.preload = "auto";
          videoEl.poster = "noposter";
          videoEl.muted = true;

          $video.css({ top: 0 + "px" });

          $("#container").append(videoEl);
        }
      }
    }
  };

  /**
   * Restart Playlist.
   */
  self.restart = function () {
    console.log("RESTART");
    var firstMedia = self.medias[0];
    var firstMediaEl = $("#" + firstMedia)[0];
    firstMediaEl.currentTime = 0;
  };

  /**
   * Play videos.
   */
  self.play = function () {
    var media = self.medias[self.currentMedia % self.medias.length];
    var mediaConfig =
      self.mediaConfigs[self.currentMedia % self.mediaConfigs.length];
    var mediaEl = $("#" + media)[0];

    mediaEl.play();

    // Video ended
    mediaEl.addEventListener("ended", function () {
      console.log("CURRENT VIDEO ONENDED");
      self.stopCurrentVideo();
    });
  };

  /**
   * Stop current video.
   */
  self.stopCurrentVideo = function () {
    var media = self.medias[self.currentMedia % self.medias.length];
    var mediaEl = $("#" + media)[0];
    var $media = $("#" + media);

    console.log(media, "stopCurrentVideo");

    console.log(mediaEl, "PAUSE");
    mediaEl.pause();

    self.currentMedia = self.currentMedia + 1;

    // Append next video'
    var nextMediaIndex = self.currentMedia % self.medias.length;
    var videoEl = document.createElement("video");
    var videoId = self.medias[nextMediaIndex];
    var $video = $(videoEl);

    videoEl.id = videoId;
    videoEl.src = self.mediaSources[nextMediaIndex];
    videoEl.preload = "auto";
    videoEl.poster = "noposter";
    videoEl.muted = true;

    console.log(videoEl, "APPEND NEXT");
    $("#container").append(videoEl);
    self.play();
    console.log(videoEl.currentTime);
    
    var timeoutSwap = 250;
    //Swap de videos delay
    
    setTimeout(function () {
      console.log(videoEl.currentTime);

      $media.css({ "z-index": 1 });
      $video.css({ "z-index": 2 });

      setTimeout(function () {
        //dispose
        mediaEl.src = "";
        mediaEl.load();
        $("#" + media).remove();
        console.log(mediaEl, "REMOVE");
      }, 250);
    }, timeoutSwap);
  };

  /**
   * Start template.
   */
  self.start = function () {
    console.log("START");

    self.ready = false;

    self.medias = [];
    self.mediaSources = [];
    self.mediaConfigs = [];

    self.currentMedia = 0;

    self.processPlaylist();
    self.play();
  };
};
