/* 3Shamrocks Studio homepage sound: the adaptive "Three Leaf Drive" score (one bed + four layers that
   crossfade by section, energy building toward the contact CTA) and four quiet cues. OFF by default, one header
   toggle, remembered across studio pages. Engine and rules: assets/audio/s3-score.js.
   Section mixes and loudness makeups come from assets/audio/source/studio_family.py (every section -16 LUFS). */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    base: 'assets/audio/studio/', loop: 38.4, musicGain: 0.4, sfxGain: 0.6,
    stems: { bed: 'home-bed', arp: 'home-arp', pulse: 'home-pulse', keys: 'home-keys', lead: 'home-lead' },
    sections: [{"id":"hero","sel":".hero","mix":{"bed":1,"arp":0.7},"makeup":1.7518},{"id":"work","sel":"#work","mix":{"bed":1,"arp":1,"pulse":1},"makeup":1.2067},{"id":"identity","sel":"#identity","mix":{"bed":1,"arp":0.8,"pulse":1,"keys":0.8},"makeup":1.1331},{"id":"experience","sel":"#experience","mix":{"bed":1,"arp":0.45,"pulse":0.55,"keys":1},"makeup":1.3079},{"id":"about","sel":"#about","mix":{"bed":1,"arp":1,"pulse":1,"keys":0.7,"lead":0.5},"makeup":1.1168},{"id":"contact","sel":"#contact","mix":{"bed":1,"arp":1,"pulse":1,"keys":0.8,"lead":1},"makeup":1.0277}],
    sfx: { url: 'assets/audio/studio/studio-sfx', lead: 0.1, motion: { explode: 1, assemble: 1, swipe: 1 },
           cues: { explode: [0.1, 0.8464], assemble: [1.1964, 0.9948], swipe: [2.4412, 0.13], click: [2.8213, 0.4939] } }
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
