/* 3Shamrocks Studio homepage: Score v2. Seven game-world zones (hero overworld, level-select products, brand showcase,
   HealthTech, the mosaic, the enchanted forest, level-complete contact), each product's own theme while it is in focus
   in the carousel, branded arrival sounds and quiet win stingers. ON by default; the first tap starts it (browser rule).
   Engine: assets/audio/s3-score.js. Music and sounds: assets/audio/source/score_v2.py and studio_sfx_v2.py. */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    base: 'assets/audio/studio/v2/', musicGain: 0.45, sfxGain: 0.6, xfade: 2.0, pxfade: 1.0, complete: 'contact',
    zones: [{"id":"hero","sel":".hero","file":"hero","loop":30.9677,"bar":1.935484},{"id":"work","sel":"#work","file":"work","loop":29.0909,"bar":1.818182},{"id":"identity","sel":"#identity","file":"identity","loop":33.1034,"bar":2.068966},{"id":"experience","sel":"#experience","file":"experience","loop":41.7391,"bar":2.608696},{"id":"about","sel":"#about","file":"about","loop":35.5556,"bar":2.222222},{"id":"forest","sel":"#contact","file":"forest","loop":40.0,"bar":2.5},{"id":"contact","sel":"#contact .contact-inner","file":"contact","loop":30.0,"bar":1.875}],
    products: { sel: '#work .dev', zone: 'work', map: {"shomer":{"match":"work/shomer.html","file":"shomer","loop":41.7391,"bar":2.608696},"lickpick":{"match":"work/lickpick.html","file":"lickpick","loop":30.9677,"bar":1.935484},"trashure-hunters":{"match":"work/trashure-hunters.html","file":"trashure-hunters","loop":34.2857,"bar":2.142857},"chore-royale":{"match":"work/chore-royale.html","file":"chore-royale","loop":30.0,"bar":1.875},"fairent":{"match":"work/fairent.html","file":"fairent","loop":38.4,"bar":2.4},"concepts":{"match":"work/concepts.html","file":"concepts","loop":35.5556,"bar":2.222222}} },
    stingers:[{sel:'.gd-toast',cue:'coin'},{sel:'.gd-panel',cue:'sparkle'}],
    sfx: [{url:'assets/audio/studio/v2/sfx',motion:{"explode":1,"assemble":1,"p_shomer":1,"p_lickpick":1,"p_trashure-hunters":1,"p_chore-royale":1,"p_fairent":1,"p_concepts":1},cues:{"explode":[7.6238,0.6975],"assemble":[8.5713,0.7977],"click":[9.6189,0.297],"coin":[4.3813,0.4979],"levelup":[5.1292,1.3963],"sparkle":[6.7754,0.5984],"p_shomer":[0.5,0.3921],"p_lickpick":[1.1421,0.398],"p_trashure-hunters":[1.79,0.3977],"p_chore-royale":[2.4377,0.3982],"p_fairent":[3.086,0.3974],"p_concepts":[3.7334,0.3979]}}]
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
