/* Tour frame. The middle of the page is the preview itself.
   A tap there stays inside the frame. It does not open another page. */
(function(){
  var view = document.getElementById("view");
  var alone = document.getElementById("alone");
  var menu = document.getElementById("menu");
  var btn = document.getElementById("menubtn");
  if (view && alone && alone.href) {
    var frame = document.createElement("iframe");
    frame.src = alone.href;
    frame.title = document.title;
    frame.setAttribute("referrerpolicy", "no-referrer");
    view.textContent = "";
    view.appendChild(frame);
  }
  if (btn && menu) {
    btn.addEventListener("click", function(){
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  /* Keep a tap on the preview from following a link that is not in this build. */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a");
    if (!a || !view || !view.contains(a)) return;
    e.preventDefault();
  }, true);
})();
