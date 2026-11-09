(function () {
  "use strict";

  document.querySelectorAll("video[data-parts]").forEach(function (video) {
    var parts = (video.getAttribute("data-parts") || "").split("|").filter(Boolean);
    if (parts.length < 2) return;
    var index = 0;
    var note = video.parentElement ? video.parentElement.querySelector(".part") : null;
    function label() {
      if (note) note.textContent = "Part " + (index + 1) + " of " + parts.length;
    }
    label();
    video.addEventListener("ended", function () {
      if (index >= parts.length - 1) return;
      index += 1;
      label();
      video.src = parts[index];
      var pending = video.play();
      if (pending && typeof pending.catch === "function") pending.catch(function () {});
    });
  });

  var form = document.querySelector(".hireform");
  if (!form) return;
  var status = form.querySelector(".status");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (typeof form.reportValidity === "function" && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var name = (form.elements.namedItem("name").value || "").trim();
    var project = (form.elements.namedItem("project").value || "").trim();
    var message = (form.elements.namedItem("message").value || "").trim();
    if (!name || !message) {
      if (status) status.textContent = "Add your name and a message.";
      return;
    }
    var subject = project ? "Project: " + project : "Hire";
    var body = "Name: " + name + "\n" + (project ? "Project: " + project + "\n" : "") + "\n" + message;
    if (body.length > 1800) {
      if (status) status.textContent = "That message is too long for a mail link. Shorten it, or write directly.";
      return;
    }
    if (status) status.textContent = "Opening your mail app.";
    window.location.href = "mailto:imjamesgill@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();
