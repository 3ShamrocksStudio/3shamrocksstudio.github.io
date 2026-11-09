/* 3Shamrocks Studio homepage: Score v4 direction B "night drive" (dark chill synthwave / downtempo, 92 BPM, E minor,
   Em9 Cmaj9 Am9 Bm7, 16 bars) played as sample-aligned stems: five bed stems (drums, bass, keys, pulse, texture) + one
   melody stem. Each zone changes the mix of the same song, never the song. In the portfolio each product swaps in its own
   melody stem: the same 3-note hook with a slight change (lead timbre or one note), fading in just before the bar line
   while the groove keeps going. Direction A (chillhop) can be rendered instead: python3 score_v4.py stems A.
   ON by default; the first tap starts it (browser rule). Engine: assets/audio/s3-score.js.
   Music: assets/audio/source/score_v4.py (stems + mix.json in assets/audio/studio/v4/). Sounds (unchanged): studio_sfx_v2.py. */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    base: 'assets/audio/studio/v4/', ver: 'sc4', musicGain: 0.45, sfxGain: 0.6, xfade: 2.0, pxfade: 0.6, mlead: 0.6, complete: 'contact',
    stems: {"loop":41.7391,"bar":2.6087,"pad":0.5,"beds":["drums","bass","keys","pulse","texture"],"melody":"mel-theme"},
    zones: [{"id":"hero","sel":".hero","mix":{"drums":1.0,"bass":1.0,"keys":1.0,"pulse":1.0,"texture":1.0,"mel":1.0}},{"id":"work","sel":"#work","mix":{"drums":1.015,"bass":1.015,"keys":0.9135,"pulse":1.1165,"texture":0.812,"mel":1.0658}},{"id":"identity","sel":"#identity","mix":{"drums":0.7146,"bass":0.9697,"keys":1.0208,"pulse":0.7146,"texture":1.0208,"mel":0.9187}},{"id":"experience","sel":"#experience","mix":{"drums":0.5109,"bass":0.9197,"keys":1.0729,"pulse":0.5109,"texture":1.124,"mel":0.9197}},{"id":"about","sel":"#about","mix":{"drums":0.79,"bass":0.9382,"keys":0.9876,"pulse":0.79,"texture":0.9876,"mel":0.8888}},{"id":"forest","sel":"#contact","mix":{"drums":0.0,"bass":0.6674,"keys":1.1124,"pulse":0.0,"texture":1.4461,"mel":0.7787}},{"id":"contact","sel":"#contact .contact-inner","mix":{"drums":1.0,"bass":1.0,"keys":1.0,"pulse":1.0,"texture":1.0,"mel":1.0}}],
    products: { sel: '#work .dev', zone: 'work', map: {"shomer":{"match":"work/shomer.html","file":"mel-shomer"},"lickpick":{"match":"work/lickpick.html","file":"mel-lickpick"},"trashure-hunters":{"match":"work/trashure-hunters.html","file":"mel-trashure-hunters"},"chore-royale":{"match":"work/chore-royale.html","file":"mel-chore-royale"},"fairent":{"match":"work/fairent.html","file":"mel-fairent"},"concepts":{"match":"work/concepts.html","file":"mel-concepts"}} },
    stingers:[{sel:'.gd-toast',cue:'coin'},{sel:'.gd-panel',cue:'sparkle'}],
    sfx: [{url:'assets/audio/studio/v2/sfx',motion:{"explode":1,"assemble":1,"p_shomer":1,"p_lickpick":1,"p_trashure-hunters":1,"p_chore-royale":1,"p_fairent":1,"p_concepts":1},cues:{"explode":[7.6238,0.6975],"assemble":[8.5713,0.7977],"click":[9.6189,0.297],"coin":[4.3813,0.4979],"levelup":[5.1292,1.3963],"sparkle":[6.7754,0.5984],"p_shomer":[0.5,0.3921],"p_lickpick":[1.1421,0.398],"p_trashure-hunters":[1.79,0.3977],"p_chore-royale":[2.4377,0.3982],"p_fairent":[3.086,0.3974],"p_concepts":[3.7334,0.3979]}}]
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
