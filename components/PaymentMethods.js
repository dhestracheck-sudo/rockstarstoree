const methods = [
  { name: "QRIS", image: "/optimized/payment-qris.webp?v=logos-20261026-2", width: 474, height: 244 },
  { name: "GoPay", image: "/optimized/payment-gopay.webp?v=logos-20261026-2", width: 64, height: 64 },
  { name: "DANA", image: "/optimized/payment-dana.webp?v=logos-20261026-2", width: 72, height: 96 },
  { name: "ShopeePay", image: "/optimized/payment-shopee.webp?v=logos-20261026-2", width: 110, height: 110 },
  { name: "OVO", image: "/optimized/payment-ovo.webp?v=logos-20261026-2", width: 64, height: 86 },
  { name: "Transfer Bank", image: "/optimized/all-bank.webp?v=logos-20261026-2", kind: "bank", alt: "ALL BANK", width: 160, height: 107 },
  { name: "Binance Pay", image: "/optimized/payment-binance.webp?v=logos-20261026-2", kind: "binance", alt: "BINANCE", width: 512, height: 107 },
];

export default function PaymentMethods() {
  return (
    <section className="brand-payment" aria-labelledby="brandPaymentTitle">
      <div className="brand-payment-copy">
        <span className="brand-payment-kicker">TOKO ROBLOX</span>
        <h2 id="brandPaymentTitle">ROCKSTAR.STORE</h2>
        <p>
          Tempat kalian menjadi <strong>sepuh</strong> di game Roblox dengan cepat. Rockstar.Store menyediakan akun <strong>sepuh</strong>, Brainrot <strong>sepuh</strong>, top up Robux, serta jasa joki Roblox <strong>profesional</strong> untuk membantu kalian naik level dengan cepat, menjadi <strong>sepuh</strong>, dan mendominasi permainan.
        </p>
        <p>
          Kami menyediakan transaksi aman, perlindungan anti-hackback, garansi keamanan 100%, dan barang-barang yang dipastikan <strong>premium</strong>. Temukan akun dari entry-level hingga akun sultan dengan item-item langka.
        </p>
        <p className="brand-payment-promise">
          Wujudkan akun dan Brainrot/pet impianmu sekarang hanya di ROCKSTAR.STORE, marketplace terpercaya di Indonesia untuk akun game Roblox, jasa joki, dan Brainrot/pet!
        </p>
      </div>

      <div className="payment-methods" aria-labelledby="paymentMethodsTitle">
        <h3 id="paymentMethodsTitle">PILIHAN METODE PEMBAYARAN</h3>
        <div className="payment-method-grid">
          {methods.map((method) => (
            <div className="payment-method" key={method.name}>
              <div className={`payment-method-mark ${method.kind || ""}`}>
                <img
                  src={method.image}
                  alt={method.alt || method.name}
                  width={method.width}
                  height={method.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span>{method.name}</span>
            </div>
          ))}
        </div>
        <p>Tersedia metode pembayaran lengkap untuk kemudahan transaksi.</p>
      </div>
    </section>
  );
}
