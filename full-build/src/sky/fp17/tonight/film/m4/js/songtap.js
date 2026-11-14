/* Songs open on the second tap. The first tap on a song link highlights it and shows its title; a tap on another song moves the selection. */
(function(){
  var RE=/\/sound\/(to-go|lost-coffee|lost-coffee-apple-music|mothers-moniker)\/?$/,sel=null,lab=null,tm=0;
  function titleOf(a){var b=a.querySelector('b');return ((b&&b.textContent)||a.textContent||'').replace(/\s+/g,' ').trim()}
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a||!RE.test(a.getAttribute('href')||''))return;
    if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    if(sel===a)return;
    e.preventDefault();
    if(sel)sel.classList.remove('songsel');
    sel=a;a.classList.add('songsel');
    if(!lab){lab=document.createElement('div');lab.id='songtitle';lab.setAttribute('aria-live','polite');document.body.appendChild(lab)}
    lab.textContent=titleOf(a)+' \u00b7 tap again to open';lab.classList.add('on');
    clearTimeout(tm);tm=setTimeout(function(){lab.classList.remove('on')},2600);
  },true);
})();
