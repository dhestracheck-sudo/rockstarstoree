(function initAdminWorkspaceHelpers() {
  const TAB_KEY = "rs_admin_active_tab_v1";
  const VALID_TABS = ["produk", "kategori", "akun", "toko"];
  const lazyLoaded = { akun: false, teks: false, spin: false, testimoni: false, server: false };

  function loadTabSectionOnce(tab) {
    const ws = document.getElementById("adminWorkspace");
    if (!ws || ws.style.display === "none") return;
    if (tab === "akun" && !lazyLoaded.akun) {
      lazyLoaded.akun = true;
      try { if (typeof loadAkunProds === "function") loadAkunProds(); } catch (_) {}
    } else if (tab === "toko") {
      if (!lazyLoaded.teks) {
        lazyLoaded.teks = true;
        try { if (typeof loadTeks === "function") loadTeks(); } catch (_) {}
      }
      const accSpin = document.getElementById("accSpin");
      const accTesti = document.getElementById("accTestimoni");
      const accServer = document.getElementById("accServer");
      if (accSpin && accSpin.open && !lazyLoaded.spin) {
        lazyLoaded.spin = true;
        try { if (typeof loadSpinAdmin === "function") loadSpinAdmin(); } catch (_) {}
      }
      if (accTesti && accTesti.open && !lazyLoaded.testimoni) {
        lazyLoaded.testimoni = true;
        try { if (typeof loadTestimoniAdmin === "function") loadTestimoniAdmin(); } catch (_) {}
      }
      if (accServer && accServer.open && !lazyLoaded.server) {
        lazyLoaded.server = true;
        try { if (typeof loadServerSettings === "function") loadServerSettings(); } catch (_) {}
      }
    }
  }

  function resetAdminLazyCache() {
    lazyLoaded.akun = false;
    lazyLoaded.teks = false;
    lazyLoaded.spin = false;
    lazyLoaded.testimoni = false;
    lazyLoaded.server = false;
  }
  window.resetAdminLazyCache = resetAdminLazyCache;

  function openAdminTab(tabName) {
    const next = VALID_TABS.includes(tabName) ? tabName : "produk";
    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      const isCurrent = btn.dataset.tab === next;
      btn.classList.toggle("active", isCurrent);
      btn.setAttribute("aria-selected", String(isCurrent));
    });
    document.querySelectorAll(".admin-tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === "tab-" + next);
    });
    try { sessionStorage.setItem(TAB_KEY, next); } catch (_) {}
    loadTabSectionOnce(next);
  }
  window.openAdminTab = openAdminTab;

  function toggleAddProdDrawer(forceOpen) {
    const box = document.getElementById("addCard");
    if (!box) return;
    const isVisible = box.style.display !== "none" && box.style.display !== "";
    const show = (typeof forceOpen === "boolean") ? forceOpen : !isVisible;
    box.style.display = show ? "block" : "none";
    if (show) {
      const nm = document.getElementById("addName");
      if (nm) setTimeout(() => nm.focus(), 40);
    }
  }
  window.toggleAddProdDrawer = toggleAddProdDrawer;

  function setProductFilter(mode) {
    window.ADMIN_STOCK_FILTER = (mode === "ready" || mode === "sold") ? mode : "all";
    document.querySelectorAll(".filter-pill-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === window.ADMIN_STOCK_FILTER);
    });
    try {
      if (typeof renderProductCatalog === "function") {
        renderProductCatalog(document.getElementById("itemSearch")?.value || "");
      }
    } catch (_) {}
  }
  window.setProductFilter = setProductFilter;

  function updateLivePreview() {
    try {
      const selectedName = document.getElementById("itemSel")?.value || "";
      const product = (typeof ALL_ITEMS !== "undefined" && Array.isArray(ALL_ITEMS))
        ? ALL_ITEMS.find((item) => String(item.name || "").trim() === selectedName)
        : null;
      if (!product) return;

      const readValue = (id, fallback) => {
        const value = document.getElementById(id)?.value ?? "";
        return value === "" ? fallback : Number(value);
      };

      const editedName = document.getElementById("nameInput")?.value.trim();
      const editedCat = document.getElementById("editCatSel")?.value || String(product.kategori || "-").trim() || "-";
      const price = readValue("priceInput", Number(product.price) || 0);
      const stock = readValue("stockInput", Number(product.stock) || 0);
      const sold = readValue("soldInput", Number(product.sold) || 0);
      const originalPrice = readValue("coretInput", Number(product.coret) || 0);
      const description = (document.getElementById("descInput")?.value || "").trim();
      const isSold = (Number.isFinite(stock) && stock <= 0) || /^(ya|y|yes|habis|sold)/i.test(String(product.soldout || "").trim());

      const soldBadge = document.getElementById("prevSoldBadge");
      const imgSold = document.getElementById("prevImgSold");
      if (soldBadge) soldBadge.style.display = isSold ? "inline-block" : "none";
      if (imgSold) imgSold.style.display = isSold ? "flex" : "none";

      const prevNameEl = document.getElementById("prevName");
      if (prevNameEl) prevNameEl.textContent = editedName || selectedName;

      const prevMetaEl = document.getElementById("prevMeta");
      if (prevMetaEl) {
        prevMetaEl.innerHTML =
          editedCat + " • Stok: " +
          (isSold ? '<b style="color:#ff5d5d;">' + stock.toLocaleString("id-ID") + " (HABIS)</b>" : stock.toLocaleString("id-ID")) +
          " • Terjual: " + sold.toLocaleString("id-ID") + (description ? " • " + description.slice(0, 70) : "");
      }

      const pricePreview = document.getElementById("prevPrice");
      if (pricePreview) {
        pricePreview.innerHTML = "Rp " + price.toLocaleString("id-ID") +
          (originalPrice > price
            ? ' <span style="font-size:13px;color:var(--mut);text-decoration:line-through;margin-left:8px;">Rp ' + originalPrice.toLocaleString("id-ID") + "</span>"
            : "");
      }
    } catch (_) {}
  }
  window.updateLivePreview = updateLivePreview;

  function mount() {
    ["accSpin", "accTestimoni", "accServer"].forEach((id) => {
      const det = document.getElementById(id);
      if (!det || det.dataset.bound) return;
      det.dataset.bound = "1";
      det.addEventListener("toggle", () => {
        if (!det.open) return;
        loadTabSectionOnce("toko");
      });
    });

    ["nameInput", "editCatSel", "priceInput", "stockInput", "soldInput", "coretInput", "descInput"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", updateLivePreview);
      if (el.tagName === "SELECT") el.addEventListener("change", updateLivePreview);
    });

    const productSelect = document.getElementById("itemSel");
    if (productSelect) productSelect.addEventListener("change", () => setTimeout(updateLivePreview, 0));

    let savedTab = "produk";
    try { savedTab = sessionStorage.getItem(TAB_KEY) || "produk"; } catch (_) {}
    openAdminTab(savedTab);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
