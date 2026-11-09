/* 3Shamrocks Studio homepage: Score v3 "Three Leaves". ONE studio theme (100 BPM, D dorian, 16 bars) played as
   sample-aligned stems: six bed stems (drums, bass, keys, pulse, texture, lift) + one melody stem. Each zone changes the
   mix of the same song, never the song (hero full, portfolio driving, lighter middle sections, enchanted forest,
   triumphant contact). In the portfolio each product swaps in its own melody stem: the same theme with a slight
   variation (lead timbre, ornament, one changed note), on the bar, while the groove keeps going.
   ON by default; the first tap starts it (browser rule). Engine: assets/audio/s3-score.js.
   Music: assets/audio/source/score_v3.py. Sounds (unchanged from v2): assets/audio/source/studio_sfx_v2.py. */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    music: false, /* Score v3 rejected 9 Nov: music paused until a new score is approved; sound effects and toggle stay */
    base: 'assets/audio/studio/v3/', ver: 'sc3b', musicGain: 0.45, sfxGain: 0.6, xfade: 2.0, pxfade: 1.0, complete: 'contact',
    stems: {"loop":38.4,"bar":2.4,"pad":0.5,"beds":["drums","bass","keys","pulse","texture","lift"],"melody":"mel-theme"},
    zones: [{"id":"hero","sel":".hero","mix":{"drums":1.0179,"bass":1.0715,"keys":1.0715,"pulse":0.7501,"texture":0.3215,"lift":0.0,"mel":1.0715}},{"id":"work","sel":"#work","mix":{"drums":1.0144,"bass":1.0144,"keys":0.8115,"pulse":1.0144,"texture":0.0,"lift":0.0,"mel":1.0144}},{"id":"identity","sel":"#identity","mix":{"drums":0.6386,"bass":1.0449,"keys":1.161,"pulse":0.5225,"texture":0.5805,"lift":0.0,"mel":0.9869}},{"id":"experience","sel":"#experience","mix":{"drums":0.4621,"bass":0.982,"keys":1.1553,"pulse":0.0,"texture":0.8087,"lift":0.0,"mel":0.982}},{"id":"about","sel":"#about","mix":{"drums":0.7376,"bass":1.0213,"keys":1.0213,"pulse":0.8511,"texture":0.2837,"lift":0.0,"mel":0.9646}},{"id":"forest","sel":"#contact","mix":{"drums":0.0,"bass":0.6378,"keys":0.7795,"pulse":0.0,"texture":1.4173,"lift":0.0,"mel":0.8504}},{"id":"contact","sel":"#contact .contact-inner","mix":{"drums":1.0094,"bass":1.0094,"keys":1.0094,"pulse":0.858,"texture":0.3533,"lift":1.0094,"mel":1.0094}}],
    products: { sel: '#work .dev', zone: 'work', map: {"shomer":{"match":"work/shomer.html","file":"mel-shomer"},"lickpick":{"match":"work/lickpick.html","file":"mel-lickpick"},"trashure-hunters":{"match":"work/trashure-hunters.html","file":"mel-trashure-hunters"},"chore-royale":{"match":"work/chore-royale.html","file":"mel-chore-royale"},"fairent":{"match":"work/fairent.html","file":"mel-fairent"},"concepts":{"match":"work/concepts.html","file":"mel-concepts"}} },
    stingers:[{sel:'.gd-toast',cue:'coin'},{sel:'.gd-panel',cue:'sparkle'}],
    sfx: [{url:'assets/audio/studio/v2/sfx',motion:{"explode":1,"assemble":1,"p_shomer":1,"p_lickpick":1,"p_trashure-hunters":1,"p_chore-royale":1,"p_fairent":1,"p_concepts":1},cues:{"explode":[7.6238,0.6975],"assemble":[8.5713,0.7977],"click":[9.6189,0.297],"coin":[4.3813,0.4979],"levelup":[5.1292,1.3963],"sparkle":[6.7754,0.5984],"p_shomer":[0.5,0.3921],"p_lickpick":[1.1421,0.398],"p_trashure-hunters":[1.79,0.3977],"p_chore-royale":[2.4377,0.3982],"p_fairent":[3.086,0.3974],"p_concepts":[3.7334,0.3979]}}]
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
