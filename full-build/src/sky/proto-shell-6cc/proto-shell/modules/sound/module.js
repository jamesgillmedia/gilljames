/* proto-shell module · sound. The Sound room itself is core (core/sound.js: every module has it); this module only gives it the A / B / C switch, so
   ?m=sound&v=A|B|C, the pills and the dev switch in the tune menu all agree. A is the main build.
   A · a low-pass closes as you pull a star; the long camera sweep runs linearly (main)
   B · the pull is a band-pass sweep instead (a crossfade, no click)
   C · low-pass, and the camera sweep draws a slow figure-eight */
(function(){
var M={id:'sound',title:'sound',chapter:'sound',variants:{A:'A · low-pass pull, linear sweep (main)',B:'B · band-pass sweep on the pull',C:'C · low-pass, figure-eight camera sweep'}};
M.variant=function(v){try{localStorage.setItem('gj.sound.var',v)}catch(e){}};
window.Shell.register(M);
})();
