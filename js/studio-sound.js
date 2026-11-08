/* 3Shamrocks Studio homepage sound: one header toggle, OFF by default, remembered per browser.
   On = the studio theme "Three Leaf Drive" (fades in) plus four quiet cues: mosaic explode / reassemble,
   carousel swipe, CTA click. Nothing plays and no AudioContext exists before the user's first gesture
   (see assets/audio/s3-audio.js). Motion-linked cues stay silent under prefers-reduced-motion. */
(function () {
  'use strict';
  var btn = document.getElementById('snd');
  if (!btn || !window.S3Audio) return;
  var KEY = 's3_studio_sound';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOTION = { explode: 1, assemble: 1, swipe: 1 };
  var A = S3Audio.create({
    base: 'assets/audio/studio/', name: 'studio', lead: 0.1, loopLen: 76.8,
    musicGain: 0.4, sfxGain: 0.6, sfxDefault: false, musicDefault: false,
    sprite: { explode: [0.1, 0.8464], assemble: [1.1964, 0.9948], swipe: [2.4412, 0.13], click: [2.8213, 0.4939] }
  });
  function saved() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function save(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* private mode: not remembered */ } }
  function set(on) { A.setSfx(on); A.setMusic(on); draw(); }
  function draw() {
    var on = A.music();
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); btn.title = on ? 'Sound on' : 'Sound off';
  }
  if (saved()) set(true); else draw();
  btn.addEventListener('click', function () { var on = !A.music(); save(on); set(on); });
  document.addEventListener('s3:sfx', function (e) {
    var n = e.detail; if (!A.sfx() || (RM && MOTION[n])) return; A.play(n);
  });
  document.addEventListener('click', function (e) {
    if (A.sfx() && e.target.closest && e.target.closest('.btn,.nav-cta')) A.play('click');
  }, true);
})();
