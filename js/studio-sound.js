/* 3Shamrocks Studio homepage: Score v5 "the jam" (instrumental funk / neo-soul, 98 BPM, swung 16ths, E dorian,
   Em9 A13 Em9 Cmaj9-B7#9, 16 bars) played as sample-aligned stems that tell a story with the scroll (story mode):
   hero = drums (a one-bar fill on the first interaction) -> +bass -> +funk guitar -> +Rhodes/clav + organ -> +horn stabs ->
   portfolio = full band + the lead hook (each product swaps in its own lead: same hook, own timbre + one changed note) ->
   identity / experience / about keep the band going -> forest = breakdown (no drums or horns) -> contact = full band "victory".
   Layers only add going down and drop going back up; changes start on the next bar with 1 s fades.
   ON by default; the first tap starts it (browser rule). Engine: assets/audio/s3-score.js.
   Music: assets/audio/source/score_v5.py (stems + mix.json in assets/audio/studio/v5/).
   Sounds: studio_sfx_v2.py, p_lickpick = electric guitar lick (studio_sfx_v5_lick.py). */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    base: 'assets/audio/studio/v5/', ver: 'sc5', musicGain: 0.45, sfxGain: 0.6, xfade: 1.0, pxfade: 0.6, mlead: 0.6, complete: 'contact', story: true, debounce: 150,
    stems: {"loop":39.1837,"bar":2.44898,"pad":0.5,"beds":["drums","bass","gtr","keys","organ","horns"],"melody":"mel-theme","fill":"fill","core":["drums"]},
    zones: [{"id":"hero","scroll":0,"mix":{"drums":1.277,"bass":0.0,"gtr":0.0,"keys":0.0,"organ":0.0,"horns":0.0,"mel":0.0}},{"id":"bass","sel":".hero","at":0.4,"scroll":0.12,"mix":{"drums":1.0696,"bass":1.0696,"gtr":0.0,"keys":0.0,"organ":0.0,"horns":0.0,"mel":0.0}},{"id":"guitar","sel":".hero","at":0.75,"scroll":0.3,"mix":{"drums":1.0683,"bass":1.0683,"gtr":1.0683,"keys":0.0,"organ":0.0,"horns":0.0,"mel":0.0}},{"id":"keys","sel":"#work","at":0.0,"mix":{"drums":1.0646,"bass":1.0646,"gtr":1.0646,"keys":1.0646,"organ":1.0646,"horns":0.0,"mel":0.0}},{"id":"horns","sel":"#work .stage-head","at":1.0,"mix":{"drums":1.1097,"bass":1.1097,"gtr":1.1097,"keys":1.1097,"organ":1.1097,"horns":1.1097,"mel":0.0}},{"id":"work","sel":"#work .devices","at":0.12,"mix":{"drums":1.017,"bass":1.017,"gtr":1.017,"keys":1.017,"organ":1.017,"horns":1.017,"mel":1.017}},{"id":"identity","sel":"#identity","at":0.0,"mix":{"drums":1.0871,"bass":1.0871,"gtr":1.0871,"keys":1.0871,"organ":1.0871,"horns":0.8696,"mel":0.5979}},{"id":"experience","sel":"#experience","at":0.0,"mix":{"drums":1.0981,"bass":1.0981,"gtr":1.0981,"keys":1.0981,"organ":1.0981,"horns":0.7687,"mel":0.4942}},{"id":"about","sel":"#about","at":0.0,"mix":{"drums":1.0586,"bass":1.0586,"gtr":1.0586,"keys":1.0586,"organ":1.0586,"horns":0.9528,"mel":0.794}},{"id":"forest","sel":"#contact","at":0.0,"mix":{"drums":0.0,"bass":1.1043,"gtr":0.6748,"keys":1.411,"organ":1.4724,"horns":0.0,"mel":0.0}},{"id":"contact","sel":"#contact .contact-inner","at":0.0,"mix":{"drums":1.05,"bass":1.0,"gtr":1.0,"keys":1.0,"organ":1.0,"horns":1.2,"mel":1.0}}],
    products: { sel: '#work .dev', zone: 'work', map: {"shomer":{"match":"work/shomer.html","file":"mel-shomer"},"lickpick":{"match":"work/lickpick.html","file":"mel-lickpick"},"trashure-hunters":{"match":"work/trashure-hunters.html","file":"mel-trashure-hunters"},"chore-royale":{"match":"work/chore-royale.html","file":"mel-chore-royale"},"fairent":{"match":"work/fairent.html","file":"mel-fairent"},"milo":{"match":"work/milo.html","file":"mel-milo"},"concepts":{"match":"work/concepts.html","file":"mel-concepts"},"rk":{"match":"work/rk.html","file":"mel-concepts"}} },
    stingers:[{sel:'.gd-toast',cue:'coin'},{sel:'.gd-panel',cue:'sparkle'}],
    sfx: [{url:'assets/audio/studio/v2/sfx',motion:{"explode":1,"assemble":1,"p_shomer":1,"p_lickpick":1,"p_trashure-hunters":1,"p_chore-royale":1,"p_fairent":1,"p_concepts":1},cues:{"explode":[7.6238,0.6975],"assemble":[8.5713,0.7977],"click":[9.6189,0.297],"coin":[4.3813,0.4979],"levelup":[5.1292,1.3963],"sparkle":[6.7754,0.5984],"p_shomer":[0.5,0.3921],"p_lickpick":[1.1421,0.6],"p_trashure-hunters":[1.79,0.3977],"p_chore-royale":[2.4377,0.3982],"p_fairent":[3.086,0.3974],"p_concepts":[3.7334,0.3979]}}]
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
