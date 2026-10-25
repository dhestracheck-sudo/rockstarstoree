
/* tombol kembali HP = kembali di web: tutup popup dulu, bukan close web */
(function backTrap(){
  function openLayers(){
    const L = [];
    ["detailModal", "serverModal", "cartModal", "wishModal"].forEach(function(id){
      try { const el = document.getElementById(id); if(el && el.style.display === "block") L.push(id); } catch(e){}
    });
    try { if(document.getElementById("checkoutModal")) L.push("checkoutModal"); } catch(e){}
    return L;
  }
  function closeLayer(id){
    try {
      if(id === "checkoutModal"){ closeCheckoutPreview(); return; }
      const el = document.getElementById(id);
      if(el) el.style.display = "none";
      if(id === "detailModal"){ detailCur = null; }
    } catch(e){}
  }
  try { history.pushState({ rs: 1 }, ""); } catch(e){}
  window.addEventListener("popstate", function(){
    const L = openLayers();
    if(L.length){
      closeLayer(L[L.length - 1]);
      try { history.pushState({ rs: 1 }, ""); } catch(e){}
    }
  });
})();
