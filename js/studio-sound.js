/* 3Shamrocks Studio homepage: Score "Calm" (soft ambient, ~60 BPM, C major — Cmaj7 Am7 Fmaj7 Gadd9 ...),
   warm detuned pads + gentle sub + airy shimmer + sparse pentatonic bells, played as sample-aligned stems on one
   clock (story mode) so it never drifts and loops seamlessly. Deliberately subtle and consonant — meant to soothe,
   never compete with the content. Layers add gently going down the page and drop going back up; changes start on the
   next bar with ~2 s equal-power fades.
   hero = pad -> +warm sub -> +shimmer -> portfolio adds soft bells -> identity/experience breakdowns stay gentle ->
   contact = full but still soft.
   ON by default; the first tap starts it (browser autoplay rule). Engine: assets/audio/s3-score.js.
   Music stems + SFX sprite: assets/audio/soft/ (render_soft.py / sfx_soft.py). ver 'soft1' busts the cache. */
(function () {
  'use strict';
  if (!window.S3Score) return;
  var S = S3Score.start({
    base: 'assets/audio/soft/', ver: 'soft1', musicGain: 0.42, sfxGain: 0.5, xfade: 2.0, pxfade: 1.0, mlead: 0.6, complete: 'contact', story: true, debounce: 150,
    stems: { loop: 32.0, bar: 4.0, pad: 0, beds: ['pad', 'warm', 'shimmer'], melody: 'mel', core: ['pad'] },
    zones: [
      { id: 'hero', scroll: 0, mix: { pad: 0.85, warm: 0, shimmer: 0, mel: 0 } },
      { id: 'bass', sel: '.hero', at: 0.4, scroll: 0.12, mix: { pad: 1.0, warm: 0.8, shimmer: 0, mel: 0 } },
      { id: 'guitar', sel: '.hero', at: 0.75, scroll: 0.3, mix: { pad: 1.0, warm: 0.85, shimmer: 0.5, mel: 0 } },
      { id: 'keys', sel: '#work', at: 0.0, mix: { pad: 1.0, warm: 0.85, shimmer: 0.6, mel: 0 } },
      { id: 'horns', sel: '#work .stage-head', at: 1.0, mix: { pad: 1.0, warm: 0.9, shimmer: 0.7, mel: 0 } },
      { id: 'work', sel: '#work .devices', at: 0.12, mix: { pad: 1.0, warm: 0.85, shimmer: 0.7, mel: 1.0 } },
      { id: 'identity', sel: '#identity', at: 0.0, mix: { pad: 0.8, warm: 1.0, shimmer: 0, mel: 0 } },
      { id: 'experience', sel: '#experience', at: 0.0, mix: { pad: 0.7, warm: 0.9, shimmer: 0.8, mel: 0 } },
      { id: 'about', sel: '#about', at: 0.0, mix: { pad: 0.9, warm: 0.8, shimmer: 0, mel: 0.7 } },
      { id: 'forest', sel: '#contact', at: 0.0, mix: { pad: 1.0, warm: 0, shimmer: 0.9, mel: 0 } },
      { id: 'contact', sel: '#contact .contact-inner', at: 0.0, mix: { pad: 1.0, warm: 0.85, shimmer: 0.8, mel: 0.8 } }
    ],
    products: { sel: '#work .dev', zone: 'work', map: {
      "shomer": { "match": "work/shomer.html", "file": "mel" },
      "lickpick": { "match": "work/lickpick.html", "file": "mel" },
      "trashure-hunters": { "match": "work/trashure-hunters.html", "file": "mel" },
      "chore-royale": { "match": "work/chore-royale.html", "file": "mel" },
      "fairent": { "match": "work/fairent.html", "file": "mel" },
      "milo": { "match": "work/milo.html", "file": "mel" },
      "rk": { "match": "work/rk.html", "file": "mel" },
      "concepts": { "match": "work/concepts.html", "file": "mel" }
    } },
    stingers: [{ sel: '.gd-toast', cue: 'coin' }, { sel: '.gd-panel', cue: 'sparkle' }],
    sfx: [{ url: 'assets/audio/soft/sfx', motion: { "explode": 1, "assemble": 1, "p_shomer": 1, "p_lickpick": 1, "p_trashure-hunters": 1, "p_chore-royale": 1, "p_fairent": 1, "p_milo": 1, "p_rk": 1, "p_concepts": 1 }, cues: {"p_shomer": [0.0, 0.42], "p_lickpick": [0.48, 0.55], "p_trashure-hunters": [1.09, 0.42], "p_chore-royale": [1.57, 0.42], "p_fairent": [2.05, 0.42], "p_milo": [2.53, 0.5], "p_rk": [3.09, 0.5], "p_concepts": [3.65, 0.42], "coin": [4.13, 0.5], "levelup": [4.69, 1.4], "sparkle": [6.15, 0.6], "explode": [6.81, 0.7], "assemble": [7.57, 0.8], "click": [8.43, 0.18]} }]
  });
  document.addEventListener('click', function (e) {
    if (S.on() && e.target.closest && e.target.closest('.btn,.nav-cta')) S.play('click');
  }, true);
})();
