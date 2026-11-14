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
    } catch(e){}
    return audioCtx;
  }

  // Auto-unlock audio saat interaksi touch/klik di HP (iOS Safari & Android WebViews)
  var isAudioUnlocked = false;
  function unlockAudioEngine() {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        ctx.resume().catch(function(){});
      }
      if (!isAudioUnlocked) {
        // Mainkan silent buffer untuk unlock audio engine mobile
        var buf = ctx.createBuffer(1, 1, 22050);
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        isAudioUnlocked = true;
      }
    } catch(e){}
  }

  // Pasang listener unlock pada semua gesture interaksi user
  ["touchstart", "touchend", "pointerdown", "mousedown", "click", "keydown"].forEach(function(ev){
    window.addEventListener(ev, unlockAudioEngine, { passive: true, capture: true });
  });

  // Helper pemutaran nada: WAJIB SYNCHRONOUS dalam callstack user gesture agar tidak diblokir browser
  function playTone(callback) {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      // Resume context secara synchronous
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        ctx.resume().catch(function(){});
      }

      // Pastikan 'now' valid dan aman untuk penjadwalan Web Audio
      var now = (ctx.currentTime && ctx.currentTime > 0) ? ctx.currentTime : 0.005;
      callback(ctx, now);
    } catch(e){}
  }

  // 1. Tactile Click Sound (Renyah, Jelas, & Sangat Memuaskan di Speaker HP Kentang maupun iPhone)
  // Menggabungkan transient snap attack (1400Hz -> 500Hz) + warm tactile pop (680Hz -> 320Hz)
  function playClickSound() {
    playTone(function(ctx, now) {
      // Transient snap attack (renyah, terdengar jelas seketika di speaker HP)
      var oscClick = ctx.createOscillator();
      var gainClick = ctx.createGain();
      oscClick.type = "triangle";
      oscClick.frequency.setValueAtTime(1400, now);
      oscClick.frequency.exponentialRampToValueAtTime(500, now + 0.018);
      gainClick.gain.setValueAtTime(0.38, now);
      gainClick.gain.linearRampToValueAtTime(0.001, now + 0.018);
      oscClick.connect(gainClick);
      gainClick.connect(ctx.destination);
      oscClick.start(now);
      oscClick.stop(now + 0.018);

      // Body pop (body bulat & mantap)
      var oscBody = ctx.createOscillator();
      var gainBody = ctx.createGain();
      oscBody.type = "sine";
      oscBody.frequency.setValueAtTime(680, now);
      oscBody.frequency.exponentialRampToValueAtTime(320, now + 0.065);
      gainBody.gain.setValueAtTime(0.42, now);
      gainBody.gain.linearRampToValueAtTime(0.001, now + 0.065);
      oscBody.connect(gainBody);
      gainBody.connect(ctx.destination);
      oscBody.start(now);
      oscBody.stop(now + 0.065);
    });
  }

  // 2. Crystal Chime Reward Sound (Untuk aksi belanja: Beli, Keranjang, Checkout, Wishlist)
  function playLuxuryChime() {
    playTone(function(ctx, now) {
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.14);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.18);

      gain.gain.setValueAtTime(0.36, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    });
  }

  window.playClickSound = playClickSound;
  window.playLuxuryChime = playLuxuryChime;

  // 3. Efek Partikel Meluncur ke Keranjang
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

  // 4. Capture Listener Global pada Window: SETIAP KLIK PRODUK & TOMBOL BERBUNYI
  var lastSoundTime = 0;
  function handleGlobalButtonClick(e) {
    var now = Date.now();
    if (now - lastSoundTime < 65) return;

    var target = e.target;
    if (!target) return;

    // 4A. Cek tombol beli / keranjang / wishlist (Chime)
    var buyBtn = target.closest("button.btn, .wishbtn, .cartbtn, [onclick*='addItem'], [onclick*='flashAdd']");
    if (buyBtn) {
      lastSoundTime = now;
      playLuxuryChime();
      if (e.clientX && e.clientY) {
        triggerCartFly(e.clientX, e.clientY);
      }
      return;
    }

    // 4B. Cek KARTU PRODUK -> Disamakan 100% dengan suara tombol beranda (playClickSound)
    var productCard = target.closest(".item, [data-viewname], [onclick*='openDetail']");
    if (productCard) {
      lastSoundTime = now;
      playClickSound();
      return;
    }

    // 4C. Tombol & Link navigasi umum lainnya (Tactile Click Pop)
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

  // Pasang pada pointerdown, click, dan touchend dengan debounce 65ms
  // agar 100% jalan di semua tipe browser HP (Chrome Android, Safari iOS, Samsung dsb)
  window.addEventListener("pointerdown", handleGlobalButtonClick, true);
  window.addEventListener("click", handleGlobalButtonClick, true);
  window.addEventListener("touchend", handleGlobalButtonClick, true);

})();
