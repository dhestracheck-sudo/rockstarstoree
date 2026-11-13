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

  // 1. Tactile Click Sound (Untuk tombol navigasi, tab, kategori, menu, back, close)
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
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.14);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1320, now); // E6 note
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

  // 4. Capture Listener Global pada Window: SETIAP TEKAN TOMBOL PASTI BERBUNYI
  var lastSoundTime = 0;
  function handleGlobalButtonClick(e) {
    var now = Date.now();
    if (now - lastSoundTime < 45) return;

    var target = e.target;
    if (!target) return;

    var btn = target.closest("button, a, input[type='button'], input[type='submit'], [role='button'], .btn, .fab, .fab-main, .tab, .cat-card, .wishbtn, .cartbtn, .ghost, .go, .wa, .danger, .del, .backbtn, [onclick]");
    if (!btn) return;

    lastSoundTime = now;

    var txt = (btn.innerText || btn.getAttribute("aria-label") || btn.className || "").toLowerCase();
    var isPurchase = txt.indexOf("keranjang") !== -1 ||
                     txt.indexOf("beli") !== -1 ||
                     txt.indexOf("cart") !== -1 ||
                     txt.indexOf("checkout") !== -1 ||
                     txt.indexOf("flash") !== -1 ||
                     btn.classList.contains("wishbtn");

    if (isPurchase) {
      playLuxuryChime();
      if (e.clientX && e.clientY) {
        triggerCartFly(e.clientX, e.clientY);
      }
    } else {
      playClickSound();
    }
  }

  // Gunakan Capture Phase di window agar tidak bisa dicegah oleh stopPropagation komponen anak
  window.addEventListener("pointerdown", handleGlobalButtonClick, true);

})();
