/* 3d-sky loads m4's film player (../js/filmplayer.js) as is. Its data (../js/filmdata.js) names files from m4's root,
 so they get '../' here, once, before the player reads them. Same files, no copies. */
(function(){var up=function(p){return p&&!/^(https?:|\/|\.\.\/|data:)/.test(p)?'../'+p:p};
(window.GJ_FILMS||[]).forEach(function(f){['poster','pv','sc','page'].forEach(function(k){f[k]=up(f[k])});f.stills=(f.stills||[]).map(up);
  if(f.play){f.play.poster=up(f.play.poster);(f.play.parts||[]).forEach(function(p){p.src=up(p.src)});(f.play.shots||[]).forEach(function(s){s.th=up(s.th)})}})})();
