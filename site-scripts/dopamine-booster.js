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

  // 3. Social Proof & Live Sales FOMO Toast
  var FOMO_DATA = [
    { name: "Farel", loc: "Surabaya", item: "Brainrot Mecha Cerberus" },
    { name: "Rizky", loc: "Jakarta Barat", item: "Robux 1.000 Instant" },
    { name: "Dimas", loc: "Bandung", item: "Akun Sepuh Blox Fruits Level Max" },
    { name: "Alif", loc: "Medan", item: "Moon Bloom Seed (Grow A Garden)" },
    { name: "Bryan", loc: "Tangerang", item: "Joki Sepuh Steal an Egg Max" },
    { name: "Kevin", loc: "Semarang", item: "Brainrot 1SP Random Sepuh" },
    { name: "Naufal", loc: "Bekasi", item: "Robux 2.500 Kilat" },
    { name: "Arka", loc: "Yogyakarta", item: "Akun Sepuh Fisch Rod Mythic" },
    { name: "Fikri", loc: "Makassar", item: "Sun Bloom Seed Special" },
    { name: "Reza", loc: "Malang", item: "Paket Joki Level Sepuh Roblox" }
  ];

  var fomoIdx = 0;
  var fomoContainer = null;

  function showNextFomo() {
    if (!document.body) return;
    if (!fomoContainer) {
      fomoContainer = document.createElement("div");
      fomoContainer.id = "fomoLiveToast";
      fomoContainer.className = "fomo-toast";
      document.body.appendChild(fomoContainer);
      fomoContainer.addEventListener("click", function(){
        fomoContainer.classList.remove("fomo-show");
      });
    }

    var data = FOMO_DATA[fomoIdx % FOMO_DATA.length];
    fomoIdx++;

    var randomSec = Math.floor(Math.random() * 25) + 5;
    fomoContainer.innerHTML = 
      '<div class="fomo-avatar">⚡</div>' +
      '<div class="fomo-content">' +
        '<div class="fomo-title"><b>' + data.name + '</b> (' + data.loc + ')</div>' +
        '<div class="fomo-desc">Membeli <span class="fomo-item">' + data.item + '</span></div>' +
        '<div class="fomo-time">' + randomSec + ' detik yang lalu • <span class="fomo-check">✓ Sukses</span></div>' +
      '</div>' +
      '<div class="fomo-close">&times;</div>';

    fomoContainer.classList.add("fomo-show");

    // Hide after 4.8 seconds
    setTimeout(function(){
      if (fomoContainer) fomoContainer.classList.remove("fomo-show");
    }, 4800);
  }

  // First toast after 7s, then every 22-35s
  setTimeout(function(){
    showNextFomo();
    setInterval(function(){
      showNextFomo();
    }, 28000);
  }, 7000);

})();
