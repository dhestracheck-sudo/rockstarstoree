// Tombol kembali HP = kembali di web: riwayat halaman + kategori, bukan keluar web.
// Popup tetap diurus backTrap (home-06.js): kalau popup terbuka, handler ini diam.
(function backNav() {
  var lastPushed = "";
  var openIds = ["detailModal", "serverModal", "cartModal", "wishModal", "checkoutModal"];

  function modalOpen() {
    for (var k = 0; k < openIds.length; k++) {
      try {
        var el = document.getElementById(openIds[k]);
        if (el && el.style.display === "block") return true;
        if (openIds[k] === "checkoutModal" && el) return true;
      } catch (e) {}
    }
    return false;
  }

  function curState() {
    var cat = -1;
    try { cat = (typeof shownCat === "number") ? shownCat : -1; } catch (e) {}
    var page = "home";
    try { page = currentPage || "home"; } catch (e) {}
    return { rs: 1, page: page, cat: cat };
  }

  function pushCur() {
    try {
      var key = JSON.stringify(curState());
      if (key === lastPushed) return;
      lastPushed = key;
      history.pushState(curState(), "");
    } catch (e) {}
  }

  window.addEventListener("popstate", function (e) {
    if (modalOpen()) return;
    var s = e && e.state;
    if (!s || !s.page) return;
    try {
      currentPage = s.page;
      shownCat = (typeof s.cat === "number") ? s.cat : -1;
      if (typeof render === "function") render();
      if (shownCat >= 0 && typeof paintItems === "function") paintItems(true);
      if (typeof updateUrl === "function") updateUrl();
      lastPushed = JSON.stringify(curState());
    } catch (err) {}
  });

  function hook() {
    if (typeof goToCatalogPage !== "function" ||
        typeof goHome !== "function" ||
        typeof showItems !== "function") {
      window.setTimeout(hook, 300);
      return;
    }
    if (goToCatalogPage.__rsBackHooked) return;
    var origPage = goToCatalogPage;
    var origHome = goHome;
    var origShow = showItems;
    window.goToCatalogPage = function () { var r = origPage.apply(this, arguments); pushCur(); return r; };
    window.goHome = function () { var r = origHome.apply(this, arguments); pushCur(); return r; };
    window.showItems = function () { var r = origShow.apply(this, arguments); pushCur(); return r; };
    goToCatalogPage.__rsBackHooked = true;
    try {
      lastPushed = JSON.stringify(curState());
      history.replaceState(curState(), "");
    } catch (e) {}
  }

  if (document.readyState === "complete" || document.readyState === "interactive") hook();
  else document.addEventListener("DOMContentLoaded", hook);
})();
