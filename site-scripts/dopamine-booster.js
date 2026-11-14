(function(){
  if (typeof window === "undefined") return;

  // ===== DATA URI SOUND ASSETS (ZERO NETWORK LATENCY, ZERO CLIPPING) =====
  // 1. Tactile Switch Pop Sound (70ms, 950Hz -> 380Hz, renyah & mantap di speaker HP)
  var CLICK_WAV = "data:audio/wav;base64,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AwD///r/9P/v/+r/5f/g/9v/1v/S/83/yf/F/8H/vf+6/7f/tP+x/6//rf+r/6n/qP+n/6f/p/+n/6j/qf+q/6z/rv+w/7P/tv+5/7z/wP/E/8j/zf/R/9b/2//g/+X/6//w//b/+/8AAAUACgAQABUAGgAfACQAKAAtADEANQA5AD0AQABDAEYASABKAEwATgBPAFAAUABQAFAAUABPAE4ATQBLAEkARwBFAEIAQAA9ADkANgAyAC8AKwAnACMAHwAaABYAEgAOAAkABQABAP7/+v/2//L/7v/r/+f/5P/h/93/2//Y/9X/0//R/8//zf/M/8v/yf/J/8j/x//H/8f/x//H/8j/yf/J/8r/zP/N/87/0P/S/9T/1v/Y/9r/3f/f/+H/5P/n/+n/7P/v//L/9f/4//v//v8AAAIABQAIAAsADgAQABMAFgAYABsAHQAfACIAJAAmACgAKQArACwALgAvADAAMQAxADIAMgAzADMAMwAyADIAMQAwAC8ALgAtACsAKgAoACYAJAAiAB8AHQAaABcAFAASAA4ACwAIAAUAAgD///z/+f/1//L/7//r/+j/5f/i/9//3P/a/9f/1f/S/9D/zv/N/8v/yv/J/8j/x//H/8b/xv/G/8f/x//I/8n/y//M/87/0P/S/9T/1//Z/9z/3//i/+X/6P/s/+//8v/2//n//f8AAAMABwAKAA0AEQAUABcAGgAdACAAIgAlACcAKQArAC0ALwAwADEAMgAzADQANAA0ADQANAAzADMAMgAxADAALgAtACsAKQAnACUAIwAhAB4AHAAZABYAFAARAA4ACwAJAAYAAwAAAP///P/6//f/9f/y//D/7v/s/+r/6P/m/+T/4//i/+D/3//e/93/3f/c/9z/2//b/9v/2//b/9z/3P/d/93/3v/f/+D/4f/i/+P/5f/m/+j/6f/r/+z/7v/w//L/8//1//f/+f/7//3///8AAAEAAwAFAAcACQALAAwADgAQABEAEwAUABYAFwAYABoAGwAcAB0AHgAeAB8AIAAgACAAIQAhACEAIQAhACAAIAAfAB8AHgAdABwAGwAaABkAFwAWABQAEwARAA8ADQALAAkABwAFAAMAAQAAAP7/+//5//f/9f/z//H/7//t/+v/6f/n/+b/5P/j/+H/4P/f/97/3f/c/9z/2//b/9v/2//b/9v/2//c/93/3f/e/+D/4f/i/+T/5f/n/+n/6//t/+//8f/z//X/9//6//z//v8AAAIABAAGAAkACwANAA8AEQATABUAFgAYABkAGwAcAB0AHgAfACAAIQAhACEAIgAiAA==";

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
      var sampleRate = ctx.sampleRate || 44100;
      var duration = 0.072;
      var total = Math.floor(sampleRate * duration);
      var buffer = ctx.createBuffer(1, total, sampleRate);
      var data = buffer.getChannelData(0);
      var attackDuration = 0.003;
      for (var i = 0; i < total; i++) {
        var t = i / sampleRate;
        var progress = t / duration;
        var attack = t < attackDuration ? 0.5 * (1 - Math.cos(Math.PI * t / attackDuration)) : 1.0;
        var decay = Math.exp(-progress * 6.5);
        var freq = 420 + (680 - 420) * Math.exp(-progress * 20);
        var phase = 2 * Math.PI * freq * t;
        var l1 = Math.sin(phase);
        var l2 = Math.sin(phase * 1.5) * 0.35;
        var l3 = Math.sin(phase * 0.5) * 0.25;
        data[i] = (l1 * 0.65 + l2 * 0.22 + l3 * 0.13) * attack * decay * 0.95;
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
