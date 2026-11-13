(function(){
  if (typeof window === "undefined") return;

  // Web Audio Context Engine dengan Auto-Unlock untuk HP & Desktop
  var audioCtx = null;
  function getAudioContext() {
    try {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    } catch(e){}
    return audioCtx;
  }

  // Auto-unlock audio saat interaksi pertama agar diizinkan oleh sistem browser HP
  var unlockEvents = ["touchstart", "touchend", "pointerdown", "mousedown", "click"];
  function unlockAudio() {
    getAudioContext();
    unlockEvents.forEach(function(ev){
      window.removeEventListener(ev, unlockAudio, true);
    });
  }
  unlockEvents.forEach(function(ev){
    window.addEventListener(ev, unlockAudio, true);
  });

  // 1. Tactile Click Sound (Untuk tombol navigasi, tab, menu, back, close modal)
  function playClickSound() {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch(e){}
  }

  // 2. Crystal Chime Reward Sound (Untuk aksi belanja: Beli, Keranjang, Checkout, Wishlist)
  function playLuxuryChime() {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.14);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.18);

      gain.gain.setValueAtTime(0.30, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch(e){}
  }

  // 3. ULTRA-CRISPY ASMR CHOCOLATE SNAP (Retakan Coklat Super Renyah Garing)
  function playChocolateSnap() {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      // Layer 1: Multi-Fracture Granular Crackle (3 micro-cracks berturut-turut: k-k-KREK!)
      var duration = 0.075;
      var bufferSize = Math.floor(ctx.sampleRate * duration);
      var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);

      for (var i = 0; i < bufferSize; i++) {
        var t = i / ctx.sampleRate;
        var env1 = Math.exp(-t / 0.007);
        var env2 = (t > 0.011) ? Math.exp(-(t - 0.011) / 0.008) * 0.90 : 0;
        var env3 = (t > 0.024) ? Math.exp(-(t - 0.024) / 0.012) * 0.75 : 0;
        var env = env1 + env2 + env3;
        data[i] = (Math.random() * 2 - 1) * env;
      }

      var noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass di frekuensi 4400Hz (area crispiness tertinggi telinga manusia)
      var crispFilter = ctx.createBiquadFilter();
      crispFilter.type = "bandpass";
      crispFilter.frequency.setValueAtTime(4400, now);
      crispFilter.Q.setValueAtTime(3.2, now);

      var noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.48, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(crispFilter);
      crispFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // Layer 2: Fast Solid Snap (Patahan batang coklat tebal yang kokoh)
      var snapOsc = ctx.createOscillator();
      var snapGain = ctx.createGain();

      snapOsc.type = "sine";
      snapOsc.frequency.setValueAtTime(1600, now);
      snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      snapGain.gain.setValueAtTime(0.38, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.035);

      // Layer 3: Sub-Crunch Resonance (Tekstur gigitan coklat)
      var crunchOsc = ctx.createOscillator();
      var crunchGain = ctx.createGain();

      crunchOsc.type = "triangle";
      crunchOsc.frequency.setValueAtTime(720, now + 0.01);
      crunchOsc.frequency.exponentialRampToValueAtTime(140, now + 0.048);

      crunchGain.gain.setValueAtTime(0.22, now + 0.01);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

      crunchOsc.connect(crunchGain);
      crunchGain.connect(ctx.destination);

      crunchOsc.start(now + 0.01);
      crunchOsc.stop(now + 0.048);
    } catch(e){}
  }

  window.playClickSound = playClickSound;
  window.playLuxuryChime = playLuxuryChime;
  window.playChocolateSnap = playChocolateSnap;

  // 4. Efek Partikel Meluncur ke Keranjang
  function triggerCartFly(startX, startY) {
    playLuxuryChime();

    var cartTarget = document.getElementById("cartCount") || document.querySelector(".cartbtn") || document.querySelector(".fab-main");
    var targetX = window.innerWidth - 40;
    var targetY = 30;

    if (cartTarget) {
      var rect = cartTarget.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    var dot = document.createElement("div");
    dot.className = "dopamine-fly-dot";
    dot.style.left = (startX || (window.innerWidth / 2)) + "px";
    dot.style.top = (startY || (window.innerHeight / 2)) + "px";
    document.body.appendChild(dot);

    if (cartTarget) {
      cartTarget.classList.remove("cart-bounce-pop");
      void cartTarget.offsetWidth;
      cartTarget.classList.add("cart-bounce-pop");
    }

    requestAnimationFrame(function(){
      dot.style.transform = "translate(" + (targetX - (startX || (window.innerWidth / 2))) + "px, " + (targetY - (startY || (window.innerHeight / 2))) + "px) scale(0.2)";
      dot.style.opacity = "0.2";
    });

    setTimeout(function(){
      if (dot && dot.parentNode) dot.parentNode.removeChild(dot);
    }, 550);
  }
  window.triggerCartFly = triggerCartFly;

  // 5. Capture Listener Global pada Window: SETIAP KLIK PRODUK & TOMBOL BERBUNYI
  var lastSoundTime = 0;
  function handleGlobalButtonClick(e) {
    var now = Date.now();
    if (now - lastSoundTime < 45) return;

    var target = e.target;
    if (!target) return;

    // 5A. Cek tombol beli / keranjang / wishlist
    var buyBtn = target.closest("button.btn, .wishbtn, .cartbtn, [onclick*='addItem'], [onclick*='flashAdd']");
    if (buyBtn) {
      lastSoundTime = now;
      playLuxuryChime();
      if (e.clientX && e.clientY) {
        triggerCartFly(e.clientX, e.clientY);
      }
      return;
    }

    // 5B. Cek KARTU PRODUK (ASMR Ultra-Crispy Chocolate Snap)
    var productCard = target.closest(".item, [data-viewname], [onclick*='openDetail']");
    if (productCard) {
      lastSoundTime = now;
      playChocolateSnap();
      return;
    }

    // 5C. Tombol & Link navigasi umum lainnya (Tactile Click Pop)
    var btn = target.closest("button, a, input[type='button'], input[type='submit'], [role='button'], .fab, .fab-main, .tab, .cat-card, .ghost, .go, .wa, .danger, .del, .backbtn, [onclick]");
    if (btn) {
      lastSoundTime = now;
      var txt = (btn.innerText || btn.getAttribute("aria-label") || btn.className || "").toLowerCase();
      var isPurchase = txt.indexOf("keranjang") !== -1 ||
                       txt.indexOf("beli") !== -1 ||
                       txt.indexOf("cart") !== -1 ||
                       txt.indexOf("checkout") !== -1 ||
                       txt.indexOf("flash") !== -1;

      if (isPurchase) {
        playLuxuryChime();
      } else {
        playClickSound();
      }
    }
  }

  window.addEventListener("pointerdown", handleGlobalButtonClick, true);

})();
