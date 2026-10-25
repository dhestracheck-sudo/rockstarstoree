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
        heading.textContent = headings[id];
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

    mountServerConfigToggle();

    ["nameInput", "priceInput", "stockInput", "soldInput", "coretInput", "descInput"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.addEventListener("input", updateLivePreview);
    });
    const productSelect = document.getElementById("itemSel");
    if (productSelect) productSelect.addEventListener("change", () => setTimeout(updateLivePreview, 0));
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
