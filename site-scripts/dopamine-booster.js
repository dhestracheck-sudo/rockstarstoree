(function(){
  if (typeof window === "undefined") return;

  // ===== DATA URI SOUND ASSETS (ZERO NETWORK LATENCY, ZERO CLIPPING) =====
  // 1. Tactile Switch Pop Sound (70ms, 950Hz -> 380Hz, renyah & mantap di speaker HP)
  var CLICK_WAV = "data:audio/wav;base64,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";

  // 2. Crystal Chime Sound (220ms chord A5 880Hz + E6 1320Hz + A6 1760Hz)
  var CHIME_WAV = "data:audio/wav;base64,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";

  // Pre-load audio HTML5 elements
  var clickAudioPool = [];
  var chimeAudioPool = [];
  var POOL_SIZE = 4;

  function initPools() {
    try {
      if (clickAudioPool.length === 0) {
        for (var i = 0; i < POOL_SIZE; i++) {
          var a = new Audio(CLICK_WAV);
          a.volume = 0.95;
          a.preload = "auto";
          clickAudioPool.push(a);

          var c = new Audio(CHIME_WAV);
          c.volume = 0.90;
          c.preload = "auto";
          chimeAudioPool.push(c);
        }
      }
    } catch(e){}
  }
  initPools();

  var clickPoolIdx = 0;
  function playClickAudio() {
    try {
      if (clickAudioPool.length > 0) {
        var a = clickAudioPool[clickPoolIdx % clickAudioPool.length];
        clickPoolIdx++;
        a.currentTime = 0;
        var p = a.play();
        if (p && typeof p.catch === "function") p.catch(function(){});
      } else {
        var fallback = new Audio(CLICK_WAV);
        fallback.volume = 0.95;
        fallback.play().catch(function(){});
      }
    } catch(e){}
  }

  var chimePoolIdx = 0;
  function playChimeAudio() {
    try {
      if (chimeAudioPool.length > 0) {
        var a = chimeAudioPool[chimePoolIdx % chimeAudioPool.length];
        chimePoolIdx++;
        a.currentTime = 0;
        var p = a.play();
        if (p && typeof p.catch === "function") p.catch(function(){});
      } else {
        var fallback = new Audio(CHIME_WAV);
        fallback.volume = 0.90;
        fallback.play().catch(function(){});
      }
    } catch(e){}
  }

  // ===== WEB AUDIO ENGINE (DUAL ENGINE BACKUP DENGAN BUFFER PRELOAD) =====
  var audioCtx = null;
  function getAudioContext() {
    try {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
    } catch(e){}
    return audioCtx;
  }

  var clickBuffer = null;
  function getClickBuffer(ctx) {
    if (clickBuffer) return clickBuffer;
    try {
      var sampleRate = ctx.sampleRate || 22050;
      var duration = 0.07;
      var total = Math.floor(sampleRate * duration);
      var buffer = ctx.createBuffer(1, total, sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < total; i++) {
        var t = i / sampleRate;
        var progress = t / duration;
        var env = Math.exp(-progress * 7.0);
        var freq = 380 + (950 - 380) * Math.exp(-progress * 22);
        var phase = 2 * Math.PI * freq * t;
        var wave = Math.sin(phase) * 0.8 + Math.sin(phase * 2) * 0.2;
        data[i] = wave * env * 0.95;
      }
      clickBuffer = buffer;
    } catch(e){}
    return clickBuffer;
  }

  var isAudioUnlocked = false;
  function unlockAudioEngine() {
    try {
      var ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(function(){});
      }
      if (!isAudioUnlocked) {
        // Unlock HTML5 Audio pool pada touch pertama
        clickAudioPool.forEach(function(a){
          try { a.load(); } catch(e){}
        });
        chimeAudioPool.forEach(function(c){
          try { c.load(); } catch(e){}
        });

        // Unlock Web Audio silent buffer
        if (ctx) {
          var buf = ctx.createBuffer(1, 1, 22050);
          var src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
        }
        isAudioUnlocked = true;
      }
    } catch(e){}
  }

  ["touchstart", "touchend", "pointerdown", "mousedown", "click"].forEach(function(ev){
    window.addEventListener(ev, unlockAudioEngine, { passive: true, capture: true });
  });

  // ===== PUBLIC SOUND FUNCTIONS (DUAL ENGINE: HTML5 AUDIO + WEB AUDIO BUFFER) =====
  function playClickSound() {
    // 1. Jalankan HTML5 Audio (Instan, tidak terpengaruh status suspended Web Audio)
    playClickAudio();

    // 2. Jalankan juga Web Audio BufferSource jika context aktif
    try {
      var ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") ctx.resume().catch(function(){});
        var buf = getClickBuffer(ctx);
        if (buf) {
          var src = ctx.createBufferSource();
          src.buffer = buf;
          var gain = ctx.createGain();
          gain.gain.value = 0.85;
          src.connect(gain);
          gain.connect(ctx.destination);
          src.start(0); // Mulai dari awal tanpa batas stop waktu agar tidak terpotong saat bangun
        }
      }
    } catch(e){}
  }

  function playLuxuryChime() {
    playChimeAudio();
  }

  window.playClickSound = playClickSound;
  window.playLuxuryChime = playLuxuryChime;

  // ===== PARTIKEL MELUNCUR KE KERANJANG =====
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

  // ===== GLOBAL CLICK CAPTURE PADA SEMUA ELEMEN WEBSITE =====
  var lastSoundTime = 0;
  function handleGlobalButtonClick(e) {
    var now = Date.now();
    if (now - lastSoundTime < 60) return;

    var target = e.target;
    if (!target) return;

    // A. Tombol Beli / Tambah Keranjang / Checkout / Wishlist (Chime)
    var buyBtn = target.closest("button.btn, .wishbtn, .cartbtn, [onclick*='addItem'], [onclick*='flashAdd'], [onclick*='detailAdd'], [onclick*='sendToAdmin']");
    if (buyBtn) {
      lastSoundTime = now;
      playLuxuryChime();
      if (e.clientX && e.clientY) {
        triggerCartFly(e.clientX, e.clientY);
      }
      return;
    }

    // B. Kartu Produk / Item Toko -> Klik Sound
    var productCard = target.closest(".item, [data-viewname], [onclick*='openDetail'], .banner");
    if (productCard) {
      lastSoundTime = now;
      playClickSound();
      return;
    }

    // C. Semua Tombol, Tab, Link, Menu, Floating Cart, & Elemen Onclick Lainnya
    var btn = target.closest("button, a, input[type='button'], input[type='submit'], [role='button'], .fab, .fab-main, .tab, .cat-card, .cat-pill, .ghost, .go, .wa, .danger, .del, .backbtn, [onclick], .headicons, .brand, .trust-item");
    if (btn) {
      lastSoundTime = now;
      var txt = (btn.innerText || btn.getAttribute("aria-label") || btn.className || "").toLowerCase();
      var isPurchase = txt.indexOf("keranjang") !== -1 ||
                       txt.indexOf("beli") !== -1 ||
                       txt.indexOf("cart") !== -1 ||
                       txt.indexOf("checkout") !== -1 ||
                       txt.indexOf("pesan") !== -1;

      if (isPurchase) {
        playLuxuryChime();
      } else {
        playClickSound();
      }
    }
  }

  // Pasang listener pada capture phase
  window.addEventListener("pointerdown", handleGlobalButtonClick, true);
  window.addEventListener("click", handleGlobalButtonClick, true);
  window.addEventListener("touchend", handleGlobalButtonClick, true);

})();
