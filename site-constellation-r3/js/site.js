(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var markScrolled = function () {
    document.body.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  markScrolled();
  window.addEventListener("scroll", markScrolled, { passive: true });
  var main = document.querySelector("main[data-zoom]");
  if (main && !reduce) {
    var going = false;
    main.addEventListener("click", function (e) {
      var a = e.target.closest("a.node, a.star-card, a.mini");
      if (!a || !a.href || going) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      going = true;
      var r = a.getBoundingClientRect();
      var m = main.getBoundingClientRect();
      main.style.transformOrigin = (r.left + r.width / 2 - m.left) + "px " + (r.top + r.height / 2 - m.top) + "px";
      main.classList.add("zooming");
      window.setTimeout(function () { window.location.href = a.href; }, 680);
    });
    window.addEventListener("pageshow", function () {
      going = false;
      main.classList.remove("zooming");
      main.style.transformOrigin = "";
    });
  }

  var film = document.getElementById("film");
  if (film) {
    document.querySelectorAll("[data-part]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        film.src = btn.getAttribute("data-src");
        var play = film.play();
        if (play && play.catch) play.catch(function () {});
        document.querySelectorAll("[data-part]").forEach(function (b) { b.removeAttribute("aria-current"); });
        btn.setAttribute("aria-current", "true");
      });
    });
  }

  var form = document.getElementById("hire-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var project = form.project.value.trim();
      var message = form.message.value.trim();
      if (!name || !message) return;
      var subject = project ? "Hiring Gill James — " + project : "Hiring Gill James";
      var body = message + "\n\n— " + name;
      var href = "mailto:imjamesgill@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var a = document.createElement("a");
      a.href = href;
      document.body.appendChild(a);
      a.click();
      a.remove();
      var note = document.getElementById("sent");
      if (note) note.hidden = false;
    });
  }
})();
