(function() {
  console.log("Slack hacks loader loading...");
  url_regex = new RegExp("^" + "(?:(?:haxs?)://)" + "(?:\\S+(?::\\S*)?@)?" + "(?:" + "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" + "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" + "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))?" + "\\.?" + ")" + "(?::\\d{2,5})?" + "(?:[/?#]\\S*)?" + "$", "i");
  if (typeof(TS.model) != "undefined") {
    TS.model.mac_ssb_version = 1.1
    TS.model.mac_ssb_version_minor = 4
  }

  window.loadUrl = insertUrl = function(url) {
    console.log("Injecting hax url: " + url);
    var css, s;
    console.log(url);
    if (url.match(/\.css$/)) {
      css = document.createElement('link');
      css.setAttribute('href', url);
      css.setAttribute('type', 'text/css');
      css.setAttribute('rel', 'stylesheet');
      return document.head.appendChild(css);
    } else if (url.match(/\.js$/)) {
      s = document.createElement('script');
      s.setAttribute('src', url);
      return document.head.appendChild(s);
    }
  };

  window.insertHaxUrlsFromString = insertHaxUrlsFromString = function(string) {
    var words = string.split(/\s+/);
    _.each(words, function(word) {
      if (word.match(url_regex)) {
        insertUrl(word);
      };
    });
  }

  slackHacksLoader = function() {
    if (window.slackHacksLoaded === true) {
      return
    }

    var channel_purpose;

    channel = TS.channels.getChannelByName("#slack-hacks-dev");
    if (channel != null && typeof channel != 'undefined') {
      channel_purpose = channel.purpose.value;
    }

    if (channel_purpose === null || typeof channel_purpose === 'undefined') {
      channel = TS.channels.getChannelByName("#slack-hacks");
      if (channel != null && typeof channel != 'undefined') {
        channel_purpose = channel.purpose.value;
      }
    }

    console.log(channel_purpose);

    if (channel_purpose != null && typeof channel_purpose != 'undefined') {
      window.slackHacksLoaded = true
    } else {
      return
    }

    TS.members.ensureMemberIsPresent({ user: channel.purpose.creator}).then(function() {
      creator = TS.members.getMemberById(channel.purpose.creator);
      console.log("Channel purpose was created by " + creator.name);
      if (!creator.is_owner) {
        console.log("Refusing to inject hacks from channel purpose created by non-admin " + creator.name + ": " + channel_purpose);
        return;
      }

      insertHaxUrlsFromString(channel_purpose);
    }).then(TS.members.ensureMemberIsPresent({ user: TS.boot_data.user_id})).then(function() {
      current_user = TS.members.getMemberById(TS.boot_data.user_id);
      if (typeof current_user.profile.title == "string") {
        insertHaxUrlsFromString(current_user.profile.title);
      }
    });
  };

  // slack actually loads a couple of different ways while the incremental boot
  // feature flag is going to some users but not all, so we'll just try until
  // #slack-hacks is loaded.
  var loaderInterval = setInterval(function() {
    slackHacksLoader()
    if (window.slackHacksLoaded == true) {
      clearInterval(loaderInterval)
    }
  }, 1000);

}).call(this);
