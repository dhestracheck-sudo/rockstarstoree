(function(){
  if (typeof window === "undefined") return;

  // 1. Crystal Audio Chime via Web Audio API (0 KB external files)
  var audioCtx = null;
  function playLuxuryChime() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var now = audioCtx.currentTime;
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var gainNode = audioCtx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1320, now); // E6 note
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.15);

      gainNode.gain.setValueAtTime(0.045, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch(e){}
  }
  window.playLuxuryChime = playLuxuryChime;

  // 2. Micro Particle Fly-to-Cart Effect
  function triggerCartFly(startX, startY) {
    playLuxuryChime();

    // Target cart element
    var cartTarget = document.getElementById("cartCount") || document.querySelector(".cartbtn") || document.querySelector(".fab-main");
    var targetX = window.innerWidth - 40;
    var targetY = 30;

    if (cartTarget) {
      var rect = cartTarget.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    // Sparkle particle
    var dot = document.createElement("div");
    dot.className = "dopamine-fly-dot";
    dot.style.left = (startX || (window.innerWidth / 2)) + "px";
    dot.style.top = (startY || (window.innerHeight / 2)) + "px";
    document.body.appendChild(dot);

    // Bounce cart badge animation
    if (cartTarget) {
      cartTarget.classList.remove("cart-bounce-pop");
      void cartTarget.offsetWidth; // force reflow
      cartTarget.classList.add("cart-bounce-pop");
    }

    requestAnimationFrame(function(){
      dot.style.transform = "translate(" + (targetX - (startX || 0)) + "px, " + (targetY - (startY || 0)) + "px) scale(0.2)";
      dot.style.opacity = "0.2";
    });

    setTimeout(function(){
      if (dot && dot.parentNode) dot.parentNode.removeChild(dot);
    }, 550);
  }
  window.triggerCartFly = triggerCartFly;

  // Hook globally to any add to cart click
  document.addEventListener("click", function(e){
    var btn = e.target.closest(".btn, .fab-main, [onclick*='addItem'], [onclick*='flashAdd']");
    if (btn && (btn.innerText.indexOf("Keranjang") !== -1 || btn.innerText.indexOf("Beli") !== -1 || btn.innerText.indexOf("+") !== -1)) {
      triggerCartFly(e.clientX, e.clientY);
    }
  }, true);

})();
