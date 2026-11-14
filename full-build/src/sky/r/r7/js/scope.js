/* A cinematic frame under the credits. Playback starts on a tap.
   The YouTube or Vimeo link stays on the page as the fallback. */
(function () {
  var watch = document.querySelector("a.watch");
  var hero = document.querySelector("img.hero");
  if (!watch) return;
  var href = watch.getAttribute("href") || "";

  function embed(url) {
    var youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
    if (youtube) return "https://www.youtube-nocookie.com/embed/" + youtube[1] + "?playsinline=1&rel=0&autoplay=1";
    var vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return "https://player.vimeo.com/video/" + vimeo[1] + "?playsinline=1&autoplay=1";
    return "";
  }

  var src = embed(href);
  var frame = document.createElement("div");
  frame.className = "scope";
  var stage = document.createElement("div");
  stage.className = "scope-frame";
  if (hero) {
    var still = document.createElement("img");
    still.src = hero.getAttribute("src");
    still.alt = "";
    stage.appendChild(still);
  }
  var play = document.createElement("button");
  play.type = "button";
  play.className = "scope-play";
  play.setAttribute("aria-label", "Play");
  play.textContent = "▶";
  stage.appendChild(play);
  frame.appendChild(stage);
  watch.insertAdjacentElement("afterend", frame);

  if (!src) {
    play.addEventListener("click", function () { watch.click(); });
    return;
  }
  play.addEventListener("click", function () {
    var player = document.createElement("iframe");
    player.src = src;
    player.title = (document.querySelector("h1") || {}).textContent || "Film";
    player.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    player.setAttribute("allowfullscreen", "");
    player.setAttribute("playsinline", "");
    stage.textContent = "";
    stage.appendChild(player);
  });
})();
