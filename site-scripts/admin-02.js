(function mountProductEditor() {

  const panelIds = ["mainCard", "prevCard", "renameCard", "editCard", "slideCard"];



  function mount() {

    if (document.getElementById("productEditorCard")) return;



    const firstPanel = document.getElementById(panelIds[0]);

    if (!firstPanel || !firstPanel.parentNode) return;



    const editor = document.createElement("section");

    editor.id = "productEditorCard";

    editor.className = "card product-editor-card";

    editor.style.display = "none";

    editor.innerHTML = '<div class="product-editor-heading"><h2>🛠️ Edit produk</h2><p>Pilih produk, ubah nama dan harga, lalu atur fotonya di satu tempat.</p></div>';

    firstPanel.parentNode.insertBefore(editor, firstPanel);



    const headings = {

      prevCard: "Pratinjau produk",

      renameCard: "Nama produk",

      editCard: "Harga dan detail produk",

      slideCard: "Foto produk",

    };



    panelIds.forEach((id) => {

      const panel = document.getElementById(id);

      if (!panel) return;

      panel.classList.remove("card");

      panel.classList.add("product-editor-panel");



      if (id === "mainCard") {

        const label = panel.querySelector("label");

        if (label) label.textContent = "1. Pilih produk yang akan diedit";

      } else if (headings[id]) {

        const heading = document.createElement("h3");

        if (id === "prevCard") {

          heading.innerHTML = '<span>Pratinjau produk</span><span class="prev-top-badge" style="float:right;font-size:11px;font-weight:600;color:#9bb5ff;opacity:0.85;">▲ Ke atas</span>';

        } else {

          heading.textContent = headings[id];

        }

        panel.prepend(heading);

      }



      editor.appendChild(panel);

    });



    const previewHint = document.querySelector("#prevCard .hint");

    if (previewHint) previewHint.textContent = "Pratinjau mengikuti nama dan harga yang sedang Anda ubah.";



    const photoHint = document.querySelector("#slideCard .hint");

    if (photoHint) photoHint.textContent = "Pilih foto dari kamera atau galeri, lalu tekan Tambah Foto. Foto langsung tersimpan untuk produk yang dipilih di atas.";



    const addPhotoButton = document.getElementById("slideAddBtn");

    if (addPhotoButton) addPhotoButton.textContent = "📤 Upload foto ke produk";



    const saveButton = document.getElementById("saveAllBtn");

    const deleteButton = document.getElementById("delBtn");

    const status = document.getElementById("statusAll");

    const actions = document.createElement("div");

    actions.className = "product-editor-actions";



    const saveHint = document.createElement("p");

    saveHint.className = "hint product-editor-save-hint";

    saveHint.textContent = "Simpan nama, harga, stok, diskon, dan deskripsi bersama. Foto tersimpan saat tombol upload foto ditekan.";

    if (saveButton) {

      saveButton.textContent = "💾 Simpan perubahan produk";

      actions.appendChild(saveHint);

      actions.appendChild(saveButton);

    }

    if (deleteButton) actions.appendChild(deleteButton);

    if (status) actions.appendChild(status);

    editor.appendChild(actions);



    const uploadUrlButton = document.getElementById("slideUrlBtn");

    if (uploadUrlButton) uploadUrlButton.textContent = "🔗 Tambah foto dari link";



    mountQuickProductSwitcher();

    mountServerConfigToggle();



    ["nameInput", "priceInput", "stockInput", "soldInput", "coretInput", "descInput"].forEach((id) => {

      const input = document.getElementById(id);

      if (input) input.addEventListener("input", updateLivePreview);

    });

    const productSelect = document.getElementById("itemSel");

    if (productSelect) productSelect.addEventListener("change", () => setTimeout(updateLivePreview, 0));

  }



  function mountQuickProductSwitcher() {
    const prevCard = document.getElementById("prevCard");
    if (!prevCard || document.getElementById("quickProductDrawer")) return;

    // Hapus baris petunjuk/hint di kartu pratinjau agar header ringkas dan rapi
    prevCard.querySelectorAll(".hint").forEach((el) => el.remove());

    const heading = prevCard.querySelector("h3");
    if (heading) {
      heading.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin:0 0 8px;";
      heading.innerHTML = '<span>Pratinjau produk</span><span id="prevTogglePill" class="prev-toggle-pill" style="font-size:11px; font-weight:600; color:#9bb5ff; background:rgba(43,78,255,0.22); border:1px solid rgba(153,178,255,0.25); border-radius:999px; padding:2px 8px; transition:0.15s;">▾ Ganti produk</span>';
    }

    const drawer = document.createElement("div");
    drawer.id = "quickProductDrawer";
    drawer.className = "quick-product-drawer";
    drawer.style.display = "none";
    drawer.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <input type="text" id="quickProdSearch" placeholder="🔍 Cari nama produk..." style="min-height:34px; padding:5px 9px; font-size:12px; border-radius:8px; flex:1; background:#080f1d; border:1px solid rgba(153,178,255,0.22); color:#fff;">
        <span id="quickProdCount" style="font-size:11px; color:var(--mut); white-space:nowrap;"></span>
      </div>
      <div id="quickProdList" style="display:grid; gap:5px; max-height:min(230px, 45vh); overflow-y:auto; overscroll-behavior:contain; padding-right:2px; scrollbar-width:thin;"></div>
    `;

    prevCard.appendChild(drawer);

    const pill = document.getElementById("prevTogglePill");
    const searchInput = document.getElementById("quickProdSearch");
    const listEl = document.getElementById("quickProdList");
    const countEl = document.getElementById("quickProdCount");

    let isOpen = false;

    function renderList(query) {
      const q = String(query || "").trim().toLowerCase();
      const currentSelected = document.getElementById("itemSel")?.value || document.getElementById("prevName")?.textContent || "";

      let rawItems = [];
      try {
        if (typeof ALL_ITEMS !== "undefined" && Array.isArray(ALL_ITEMS) && ALL_ITEMS.length > 0) {
          rawItems = ALL_ITEMS;
        } else if (typeof window !== "undefined" && window.ALL_ITEMS && Array.isArray(window.ALL_ITEMS)) {
          rawItems = window.ALL_ITEMS;
        }
      } catch (_) {}

      if (rawItems.length === 0) {
        const sel = document.getElementById("itemSel");
        if (sel && sel.options) {
          rawItems = Array.from(sel.options)
            .map((opt) => ({ name: (opt.value || opt.textContent || "").trim(), price: 0 }))
            .filter((o) => o.name && !o.name.includes("Memuat"));
        }
      }

      const items = rawItems.filter((o) => {
        const nm = String(o?.name || "").trim();
        if (!nm || nm.startsWith("CAT:") || nm.startsWith("INFO_")) return false;
        if (q && !nm.toLowerCase().includes(q)) return false;
        return true;
      });

      if (countEl) countEl.textContent = items.length + " produk";
      listEl.innerHTML = "";

      if (items.length === 0) {
        listEl.innerHTML = '<div style="font-size:12px; color:var(--mut); padding:8px 4px; text-align:center;">Tidak ada produk cocok.</div>';
        return;
      }

      items.forEach((item) => {
        const nm = String(item.name || "").trim();
        const price = Number(item.price) || 0;
        const isSelected = (nm === currentSelected);

        let thumb = "";
        try {
          if (typeof imgRawOf === "function") {
            const raw = imgRawOf(nm)?.v || "";
            thumb = raw.split("|").map((s) => s.trim()).filter(Boolean)[0];
          }
        } catch (_) {}
        if (!thumb && item && item.image) {
          thumb = String(item.image).split("|").map((s) => s.trim()).filter(Boolean)[0];
        }
        if (!thumb) thumb = "/ROCKSTARLOGO.png";
        else if (!thumb.startsWith("http") && !thumb.startsWith("/")) thumb = "/" + thumb;

        const row = document.createElement("div");
        row.className = "quick-prod-item" + (isSelected ? " active-prod-item" : "");
        row.style.cssText = "display:flex; align-items:center; gap:8px; padding:6px 9px; border-radius:8px; background:" + (isSelected ? "rgba(43,78,255,0.32)" : "rgba(16,26,49,0.7)") + "; border:1px solid " + (isSelected ? "#5876ff" : "rgba(153,178,255,0.14)") + "; cursor:pointer; transition:background 0.12s, border-color 0.12s;";

        row.innerHTML = `
          <img src="${thumb}" alt="" style="width:28px; height:28px; border-radius:6px; object-fit:cover; background:#080f1d; flex-shrink:0;">
          <div style="flex:1; min-width:0; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="font-size:12px; font-weight:600; color:#e6edff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${nm}</div>
            <div style="font-size:11.5px; font-weight:700; color:#f3d27a; white-space:nowrap; font-family:var(--font-oswald),sans-serif;">Rp ${price.toLocaleString("id-ID")}</div>
          </div>
        `;

        row.addEventListener("mouseenter", () => {
          if (!isSelected) {
            row.style.background = "rgba(43,78,255,0.22)";
            row.style.borderColor = "rgba(130,160,255,0.4)";
          }
        });
        row.addEventListener("mouseleave", () => {
          if (!isSelected) {
            row.style.background = "rgba(16,26,49,0.7)";
            row.style.borderColor = "rgba(153,178,255,0.14)";
          }
        });

        row.addEventListener("click", (e) => {
          e.stopPropagation();
          const sel = document.getElementById("itemSel");
          if (sel) {
            sel.value = nm;
            const nameInput = document.getElementById("nameInput");
            if (nameInput) nameInput.value = "";
            if (typeof prefill === "function") prefill();
            try { sel.dispatchEvent(new Event("change")); } catch (_) {}
          }
          toggleDrawer(false);
        });

        listEl.appendChild(row);
      });
    }

    function toggleDrawer(forceOpen) {
      isOpen = (typeof forceOpen === "boolean") ? forceOpen : !isOpen;
      drawer.style.display = isOpen ? "block" : "none";
      if (pill) {
        pill.textContent = isOpen ? "▲ Tutup" : "▾ Ganti produk";
        pill.style.background = isOpen ? "rgba(255,93,93,0.2)" : "rgba(43,78,255,0.22)";
        pill.style.borderColor = isOpen ? "rgba(255,120,120,0.35)" : "rgba(153,178,255,0.25)";
        pill.style.color = isOpen ? "#ff9494" : "#9bb5ff";
      }
      if (isOpen) {
        renderList(searchInput?.value || "");
        setTimeout(() => searchInput?.focus(), 50);
      }
    }

    drawer.addEventListener("click", (e) => e.stopPropagation());

    if (searchInput) {
      searchInput.addEventListener("input", (e) => renderList(e.target.value || ""));
    }

    prevCard.style.cursor = "pointer";
    prevCard.setAttribute("title", "Klik untuk ganti produk");
    prevCard.addEventListener("click", (e) => {
      if (e.target.closest("a, button, input, select, .quick-product-drawer")) return;
      toggleDrawer();
    });

    document.addEventListener("click", (e) => {
      if (isOpen && !prevCard.contains(e.target)) {
        toggleDrawer(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        toggleDrawer(false);
      }
    });
  }

  function mountServerConfigToggle() {

    const card = document.getElementById("serverConfigCard");

    if (!card || document.getElementById("serverConfigToggle")) return;



    const content = document.createElement("div");

    content.id = "serverConfigContent";

    while (card.firstChild) content.appendChild(card.firstChild);



    const toggle = document.createElement("button");

    toggle.id = "serverConfigToggle";

    toggle.type = "button";

    toggle.className = "ghost";

    toggle.setAttribute("aria-controls", content.id);



    const note = document.createElement("p");

    note.className = "hint server-config-toggle-note";

    note.textContent = "Pengaturan Private Server dilipat agar panel lebih ringkas.";



    card.append(toggle, note, content);



    let expanded = false;

    try {

      expanded = localStorage.getItem("rsAdminServerConfigOpen") === "true";

    } catch (_) {}



    function renderToggle() {

      content.hidden = !expanded;

      toggle.setAttribute("aria-expanded", String(expanded));

      toggle.textContent = expanded ? "🙈 Sembunyikan pengaturan Private Server" : "🔗 Tampilkan pengaturan Private Server";

      note.hidden = expanded;

    }



    toggle.addEventListener("click", () => {

      expanded = !expanded;

      try {

        localStorage.setItem("rsAdminServerConfigOpen", String(expanded));

      } catch (_) {}

      renderToggle();

    });



    renderToggle();

  }



  function updateLivePreview() {

    try {

      const selectedName = document.getElementById("itemSel")?.value || "";

      const product = ALL_ITEMS.find((item) => String(item.name || "").trim() === selectedName);

      if (!product) return;



      const readValue = (id, fallback) => {

        const value = document.getElementById(id)?.value ?? "";

        return value === "" ? fallback : Number(value);

      };

      const editedName = document.getElementById("nameInput")?.value.trim();

      const price = readValue("priceInput", Number(product.price) || 0);

      const stock = readValue("stockInput", Number(product.stock) || 0);

      const sold = readValue("soldInput", Number(product.sold) || 0);

      const originalPrice = readValue("coretInput", Number(product.coret) || 0);

      const descriptionInput = document.getElementById("descInput");

      const description = descriptionInput ? descriptionInput.value.trim() : String(product.deskripsi || "");



      document.getElementById("prevName").textContent = editedName || selectedName;

      document.getElementById("prevMeta").textContent =

        (String(product.kategori || "-").trim() || "-") + " • Stok: " + stock.toLocaleString("id-ID") +

        " • Terjual: " + sold.toLocaleString("id-ID") + (description ? " • " + description.slice(0, 80) : "");



      const pricePreview = document.getElementById("prevPrice");

      pricePreview.replaceChildren(document.createTextNode("Rp " + price.toLocaleString("id-ID")));

      if (originalPrice > price) {

        const oldPrice = document.createElement("span");

        oldPrice.style.cssText = "font-size:13px;color:var(--mut);text-decoration:line-through;margin-left:8px;";

        oldPrice.textContent = "Rp " + originalPrice.toLocaleString("id-ID");

        pricePreview.appendChild(oldPrice);

      }

    } catch (_) {

      // Abaikan pratinjau saat katalog atau input belum siap dimuat.

    }

  }



  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });

  else mount();

})();

