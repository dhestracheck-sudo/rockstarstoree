export default function MegaSlider() {
  return (
    <div className="mega">
      <div className="mega-track" id="megaTrack">
        <div className="mega-slide s0">
          <div className="mega-fig left">
            <img src="figur-8062.webp" alt="Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-fig right">
            <img src="figur-3.webp" alt="Roblox" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-in">
            <div className="mega-brand">
              {"★ ROCKSTAR.STORE ★"}
            </div>
            <p className="mega-title-w" data-i18n="sl1_t">
              {"MALU SAMA TEMAN?"}
            </p>
            <p className="mega-title-g" style={{ fontSize: "clamp(34px,6.5vw,70px)" }} data-i18n="sl1_g">
              {"KACUNG DI ROBLOX?"}
            </p>
            <p className="mega-sub" data-i18n-html="sl1_sub">
              {"TENANG, ROCKSTAR.STORE "}
              <span className="mega-blue">
                {"SOLUSINYA"}
              </span>
            </p>
            <p className="mega-tag" data-i18n-html="sl1_tag">
              {"ITEM "}
              <b>
                {"PREMIUM"}
              </b>
              {" DIJAMIN LANGSUNG "}
              <b>
                {"SEPUH"}
              </b>
              {" DAN BIKIN "}
              <b>
                {"PERCAYA DIRI"}
              </b>
            </p>
            <div className="mega-cta" style={{ justifyContent: "center" }}>
              <button className="btn-primary" onClick={(event) => { goToBrainrot(); }} data-i18n="cta_brainrot">
                {"Katalog Brainrot 🧠"}
              </button>
              <button className="btn-primary" onClick={(event) => { goToAkun(); }} data-i18n="cta_akun">
                {"Katalog Akun 👤"}
              </button>
            </div>
          </div>
        </div>
        <div className="mega-slide on">
          <div className="mega-fig left">
            <img src="figur-kiri.webp" alt="Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-fig right">
            <img src="figur-kanan1.webp" alt="Roblox" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-in">
            <div className="mega-brand">
              {"★ ROCKSTARSTORE ★"}
            </div>
            <p className="mega-title-w" data-i18n="sl2_t">
              {"WELCOME TO"}
            </p>
            <p className="mega-title-g">
              {"ROCKSTARSTORE"}
            </p>
            <p className="mega-sub" data-i18n-html="sl2_sub">
              {"TOKO ROBLOX "}
              <span className="mega-blue">
                {"NO 1 DUNIA"}
              </span>
            </p>
            <div className="mega-badges">
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl2_b1">
                  {"Harga Termurah"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl2_b2">
                  {"Proses Tercepat"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl2_b3">
                  {"Aman 100%"}
                </span>
              </span>
            </div>
            <p className="mega-tag" data-i18n-html="sl2_tag">
              {"PROSES SEMUA "}
              <b>
                {"KILAT"}
              </b>
              {" DAN DIPASTIKAN "}
              <b>
                {"SEPUH"}
              </b>
            </p>
          </div>
        </div>
        <div className="mega-slide s2">
          <div className="mega-fig left">
            <img src="figur-3.webp" alt="Roblox" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-fig right">
            <img src="figur-2.webp" alt="Robux" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-in">
            <div className="mega-brand">
              {"★ TOP UP ROBUX ★"}
            </div>
            <p className="mega-title-w" data-i18n="sl3_t">
              {"ROBUX INSTAN"}
            </p>
            <p className="mega-title-g" data-i18n="sl3_g">
              {"PALING MURAH"}
            </p>
            <p className="mega-sub" data-i18n="sl3_sub">
              {"VIA ID • GAMEPASS • GIFT CARD"}
            </p>
            <div className="mega-badges">
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl3_b1">
                  {"Proses Kilat"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl3_b2">
                  {"Payment Lengkap"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl3_b3">
                  {"Garansi 100%"}
                </span>
              </span>
            </div>
            <div className="mega-cta">
              <button className="btn-primary" onClick={(event) => { goToTopUp(); }} data-i18n="sl3_cta">
                {"Top Up Sekarang 💰"}
              </button>
            </div>
          </div>
        </div>
        <div className="mega-slide s3">
          <div className="mega-fig left">
            <img src="figur-kiri.webp" alt="Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-fig right">
            <img src="figur-kanan.webp" alt="Roblox" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
          </div>
          <div className="mega-in">
            <div className="mega-brand" data-i18n="sl4_br">
              {"★ BRAINROT & AKUN ★"}
            </div>
            <p className="mega-title-w" data-i18n="sl4_t">
              {"JADI SEPUH"}
            </p>
            <p className="mega-title-g" data-i18n="sl4_g">
              {"NAIK KELAS"}
            </p>
            <p className="mega-sub" data-i18n="sl4_sub">
              {"STOK SECRET • OG • MUTASI LANGKA"}
            </p>
            <div className="mega-badges">
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl4_b1">
                  {"Stok Terbanyak"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl4_b2">
                  {"Full Garansi"}
                </span>
              </span>
              <span className="mega-badge">
                <span className="ck">
                  {"✓"}
                </span>
                <span data-i18n="sl4_b3">
                  {"CS Fast Respon"}
                </span>
              </span>
            </div>
            <div className="mega-cta">
              <button className="btn-primary" onClick={(event) => { goToBrainrot(); }} data-i18n="sl4_cta">
                {"Lihat Katalog 🧠"}
              </button>
              <button className="btn-primary" onClick={(event) => { goToAkun(); }} data-i18n="cta_akun">
                {"Katalog Akun 👤"}
              </button>
            </div>
          </div>
        </div>
        <div className="mega-slide s4">
          <div className="mega-in mega-flex">
            <div className="mega-titlebox">
              <div className="mega-brand" data-i18n="sl5_br">
                {"★ JASA CARI AKUN ★"}
              </div>
              <p className="mega-title-w" data-i18n="sl5_t">
                {"MAU BELI"}
              </p>
              <p className="mega-title-g" data-i18n="sl5_g">
                {"AKUN GAME?"}
              </p>
              <span className="mega-ribbon" data-i18n="sl5_rib">
                {"TENANG, MIMIN ROCKSTAR BANTUIN"}
              </span>
              <div className="mega-cta" style={{ justifyContent: "flex-start" }}>
                <button className="btn-primary" onClick={(event) => { goToAkun(); }} data-i18n="sl5_cta">
                  {"Cari Akun 👤"}
                </button>
              </div>
            </div>
            <div className="mega-char">
              <img src="figur-8062.webp" alt="Mimin Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
            </div>
            <div className="mega-steps">
              <div className="mega-step">
                <b>
                  {"1."}
                </b>
                <span data-i18n="sl5_s1">
                  {"KIRIM SPEK AKUN YANG KAMU INGINKAN"}
                </span>
              </div>
              <div className="mega-step">
                <b>
                  {"2."}
                </b>
                <span data-i18n="sl5_s2">
                  {"ADMIN BANTU CARI AKUN SESUAI KEINGINAN KAMU"}
                </span>
              </div>
              <div className="mega-step">
                <b>
                  {"3."}
                </b>
                <span data-i18n="sl5_s3">
                  {"AKUN SIAP LANGSUNG DIPAKAI & NIKMATI GAMENYA"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mega-slide s5">
          <div className="mega-in mega-flex">
            <div className="mega-titlebox" style={{ textAlign: "center", alignItems: "center", marginLeft: "auto", marginRight: "auto" }}>
              <div className="mega-brand" data-i18n="sl6_br">
                {"★ JOKI SEPUH ★"}
              </div>
              <p className="mega-title-w" style={{ textAlign: "center" }} data-i18n="sl6_t">
                {"JASA JOKI"}
              </p>
              <p className="mega-title-g" style={{ textAlign: "center", fontSize: "clamp(36px,6vw,64px)" }} data-i18n="sl6_g">
                {"JOKI SEPUH BERBAGAI MAP"}
              </p>
              <p className="mega-sub" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto" }} data-i18n-html="sl6_sub">
                {"Layanan joki "}
                <span className="mega-blue">
                  {"profesional"}
                </span>
                {", "}
                <span className="mega-blue">
                  {"cepat"}
                </span>
                {", dan "}
                <span className="mega-blue">
                  {"aman 100%"}
                </span>
                {" untuk membantumu menjadi "}
                <span className="mega-blue">
                  {"sepuh"}
                </span>
                {" dengan "}
                <span className="mega-blue">
                  {"cepat"}
                </span>
                {" serta "}
                <span className="mega-blue">
                  {"mendominasi"}
                </span>
                {" game favoritmu."}
              </p>
              <div className="mega-badges" style={{ justifyContent: "center" }}>
                <span className="mega-badge" data-i18n="sl6_b1">
                  {"⚡ PROSES CEPAT"}
                </span>
                <span className="mega-badge" data-i18n="sl6_b2">
                  {"🔒 AMAN & TERPERCAYA"}
                </span>
                <span className="mega-badge">
                  {"🌐 ROCKSTARSTORE.ID"}
                </span>
              </div>
              <div className="mega-cta" style={{ justifyContent: "center" }}>
                <button className="btn-primary" style={{ background: "linear-gradient(180deg,#ffe45c,#f5a623)", color: "#1a1000" }} onClick={(event) => { goToJoki(); }} data-i18n="sl6_cta">
                  {"KLIK DISINI 👆"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mega-slide s6">
          <div className="mega-in mega-flex">
            <div className="mega-titlebox">
              <div className="mega-brand" data-i18n="sl7_br">
                {"★ SALURAN RESMI ★"}
              </div>
              <p className="mega-title-w" data-i18n-html="sl7_t">
                {"JOIN "}
                <span className="mega-gold">
                  {"SALURAN"}
                </span>
              </p>
              <p className="mega-title-g" style={{ fontSize: "clamp(28px,4.6vw,54px)" }} data-i18n="sl7_g">
                {"RESMI ROCKSTAR"}
              </p>
              <p className="mega-sub" data-i18n-html="sl7_sub">
                {"ORDER LEBIH CEPAT, ADMIN LEBIH AKTIF,"}
                <br />
                {"DAN INFORMASI LEBIH LENGKAP."}
              </p>
              <div className="mega-badges" style={{ justifyContent: "flex-start" }}>
                <a className="mega-badge join" href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noopener">
                  <span className="ck">
                    {"✓"}
                  </span>
                  <span data-i18n="sl7_cta">
                    {"JOIN SEKARANG"}
                  </span>
                </a>
              </div>
            </div>
            <div className="mega-char">
              <img src="figur-8064.webp" alt="Mimin Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
            </div>
            <div className="mega-phone">
              <img src="Screenshot%202026-10-08%20151006.webp" alt="Saluran Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
            </div>
          </div>
        </div>
        <div className="mega-slide s7">
          <div className="mega-in mega-flex">
            <div className="mega-titlebox">
              <div className="mega-brand" data-i18n="sl8_br">
                {"★ TIKTOK RESMI ★"}
              </div>
              <p className="mega-title-w">
                {"TIKTOK ROCKSTAR"}
              </p>
              <p className="mega-title-g" data-i18n="sl8_g">
                {"FOLLOW DULU YA DUL!"}
              </p>
              <div className="mega-badges" style={{ justifyContent: "flex-start" }}>
                <a className="mega-badge join" style={{ fontSize: "15px", padding: "12px 30px", background: "linear-gradient(180deg,#ffe45c,#f5a623)", color: "#1a1000", border: "none", textDecoration: "none" }} href="https://www.tiktok.com/@rockstarstoree" target="_blank" rel="noopener">
                  <span className="ck">
                    {"✓"}
                  </span>
                  {"@ROCKSTARSTOREE"}
                </a>
              </div>
              <p className="mega-tag" style={{ fontSize: "clamp(12px,2vw,17px)" }} data-i18n-html="sl8_tag">
                {"JANGAN LUPA FOLLOW DUL! WASPADA CLONE — ASLI CUMA "}
                <b>
                  {"@ROCKSTARSTOREE"}
                </b>
              </p>
            </div>
            <div className="mega-phone">
              <img src="Screenshot%202026-10-08%20135021.webp" alt="TikTok Rockstar" loading="lazy" onError={(event) => { event.currentTarget.parentElement.style.display = "none"; }} />
            </div>
          </div>
        </div>
        <button className="mega-nav l" onClick={(event) => { megaGo(megaIdx-1,true); }} aria-label="prev">
          {"❮"}
        </button>
        <button className="mega-nav r" onClick={(event) => { megaGo(megaIdx+1,true); }} aria-label="next">
          {"❯"}
        </button>
        <div className="mega-dots" id="megaDots" />
      </div>
    </div>
  );
}
