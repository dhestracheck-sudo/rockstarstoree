import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Head from "next/head";

// ==========================================
// KONFIGURASI UTAMA ROCKSTAR.STORE
// ==========================================
const TICKET_PRICE = 5000;
const VALID_ADMIN_PINS = ["112233", "123456"];
const WHATSAPP_NUMBER = "6289664299571";

// Konfigurasi Supabase Rockstar.Store (Tabel "info" baris LUCKY_SPIN_STATE_V1)
const SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
const SPIN_STATE_KEY = "LUCKY_SPIN_STATE_V1";
const LOCAL_STORAGE_KEY = "rockstar_lucky_spin_state_v1";
const BROADCAST_CHANNEL_NAME = "rockstar_lucky_spin_channel";

const PAYMENT_METHODS = [
  {
    name: "QRIS (Semua E-Wallet & Bank)",
    logo: "/optimized/payment-qris.webp",
    info: "ROCKSTAR.STORE, DIGITAL & KREATIF (Scan / Download QR)",
    copyValue: "QRIS Rockstar.Store",
    qrisImage: "/qris-rockstar-spin.jpg",
  },
  {
    name: "DANA",
    logo: "/optimized/payment-dana.webp",
    info: "0896-6429-9571 (a/n MOHAMMAD DHIANY FHARELA)",
    copyValue: "089664299571",
  },
  {
    name: "GoPay",
    logo: "/optimized/payment-gopay.webp",
    info: "0896-6429-9571 (a/n MOHAMMAD DHIANY FHARELA)",
    copyValue: "089664299571",
  },
];

const SLICE_COLORS = [
  "#7C3AED", // Violet
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#2B4EFF", // Rockstar Blue
  "#EF4444", // Red
  "#A855F7", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
];

const DEFAULT_PARTICIPANTS = [
  { id: "p1", username: "BrainrotKing99", tickets: 10, color: SLICE_COLORS[0] },
  { id: "p2", username: "RbxSlayer_ID", tickets: 5, color: SLICE_COLORS[1] },
  { id: "p3", username: "NoobMaster69", tickets: 2, color: SLICE_COLORS[2] },
  { id: "p4", username: "SkibidiSigma", tickets: 8, color: SLICE_COLORS[3] },
  { id: "p5", username: "LuckyPlayer77", tickets: 1, color: SLICE_COLORS[4] },
  { id: "p6", username: "SepuhRoblox_X", tickets: 4, color: SLICE_COLORS[5] },
];

// Cubic-bezier easing (quartic out) untuk animasi melambat alami selama 6 detik
function easeOutCubicBezier(t) {
  return 1 - Math.pow(1 - t, 4);
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ==========================================
// IKON SVG
// ==========================================
const IconTicket = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const IconTrophy = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const IconUsers = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconX = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconVolume2 = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const IconVolumeX = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" x2="16" y1="9" y2="15" />
    <line x1="16" x2="22" y1="9" y2="15" />
  </svg>
);

const IconWhatsApp = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export async function getServerSideProps({ res }) {
  // Jangan cache HTML agar perubahan state/deploy langsung terlihat instan
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return { props: { ssrGeneratedAt: new Date().toISOString() } };
}

export default function SpinPage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [prizeName, setPrizeName] = useState("Secret Brainrot");
  const [prizeProduct, setPrizeProduct] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pointedName, setPointedName] = useState("-");
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // State Modal Pembelian Tiket
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyUsername, setBuyUsername] = useState("");
  const [buyTicketCount, setBuyTicketCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showQrisPreview, setShowQrisPreview] = useState(true);

  // Refs untuk Animasi Roda (GPU CSS Transform agar 100% mulus & pasti berputar)
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const isSpinningRef = useRef(false);
  const audioCtxRef = useRef(null);
  const lastSliceIndexRef = useRef(-1);
  const lastProcessedSpinIdRef = useRef(null);
  const slicesRef = useRef([]);

  // ==========================================
  // PERHITUNGAN BOBOT POTONGAN RODA (WEIGHTED SLICE)
  // ==========================================
  const totalTickets = useMemo(() => {
    return participants.reduce((sum, p) => sum + (Number(p.tickets) || 0), 0);
  }, [participants]);

  const slices = useMemo(() => {
    if (totalTickets === 0) return [];
    let currentAngle = 0;
    return participants.map((p, idx) => {
      const t = Number(p.tickets) || 1;
      const sliceDegrees = (t / totalTickets) * 360;
      const item = {
        participant: {
          ...p,
          color: p.color || SLICE_COLORS[idx % SLICE_COLORS.length],
        },
        startAngle: currentAngle,
        endAngle: currentAngle + sliceDegrees,
        percentage: (t / totalTickets) * 100,
      };
      currentAngle += sliceDegrees;
      return item;
    });
  }, [participants, totalTickets]);

  useEffect(() => {
    slicesRef.current = slices;
    if (!isSpinningRef.current && slices.length > 0) {
      const norm = ((270 - (rotationRef.current % 360)) % 360 + 360) % 360;
      const found =
        slices.find((s) => norm >= s.startAngle && norm < s.endAngle) ||
        slices[slices.length - 1];
      if (found) setPointedName(found.participant.username);
    } else if (slices.length === 0) {
      setPointedName("-");
    }
  }, [slices]);

  // ==========================================
  // EFEK SUARA KLIK & KEMENANGAN (WEB AUDIO API)
  // ==========================================
  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(560, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore autoplay block
    }
  }, [soundEnabled]);

  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.11);
        osc.stop(ctx.currentTime + i * 0.11 + 0.36);
      });
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // ==========================================
  // GAMBAR RODA STATIS DI CANVAS (ROTASI VIA GPU CSS TRANSFORM)
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 460;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Ring Luar Roda
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 9, 0, Math.PI * 2);
    ctx.strokeStyle = "#151F38";
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.restore();

    if (slices.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0B1120";
      ctx.fill();
      ctx.strokeStyle = "#2B4EFF";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#8B96B3";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BELUM ADA PESERTA", centerX, centerY);
      return;
    }

    // Gambar Potongan Peserta pada posisi dasar (0 derajat)
    slices.forEach((slice) => {
      const startRad = (slice.startAngle * Math.PI) / 180;
      const endRad = (slice.endAngle * Math.PI) / 180;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startRad, endRad);
      ctx.closePath();

      ctx.fillStyle = slice.participant.color;
      ctx.fill();

      ctx.strokeStyle = "#060913";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Label Nama Peserta & Tiket
      const sliceSpanDeg = slice.endAngle - slice.startAngle;
      if (sliceSpanDeg >= 5.5) {
        const midAngleRad = ((slice.startAngle + slice.endAngle) / 2) * (Math.PI / 180);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(midAngleRad);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.85)";
        ctx.shadowBlur = 4;

        const fontSize = sliceSpanDeg < 13 ? 11 : sliceSpanDeg < 24 ? 13 : 15;
        ctx.font = `800 ${fontSize}px sans-serif`;

        const maxLen = 15;
        const name =
          slice.participant.username.length > maxLen
            ? slice.participant.username.slice(0, maxLen - 1) + "…"
            : slice.participant.username;

        ctx.fillText(`${name} (${slice.participant.tickets})`, radius - 18, 0);
        ctx.restore();
      }
    });

    // Lampu Bezel Dekoratif
    const numPegs = 24;
    for (let i = 0; i < numPegs; i++) {
      const pegAngle = (i * (360 / numPegs) * Math.PI) / 180;
      const px = centerX + (radius + 9) * Math.cos(pegAngle);
      const py = centerY + (radius + 9) * Math.sin(pegAngle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#FACC15" : "#6F8BFF";
      ctx.shadowColor = i % 2 === 0 ? "#FACC15" : "#6F8BFF";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    // Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 35);
    hubGrad.addColorStop(0, "#2B4EFF");
    hubGrad.addColorStop(1, "#060913");
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F3D27A";
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", centerX, centerY);
    ctx.restore();

    // Pastikan rotasi visual canvas tetap sinkron
    canvas.style.transform = `rotate(${rotationRef.current}deg)`;
  }, [slices]);

  // ==========================================
  // EKSEKUSI ANIMASI PUTARAN 6 DETIK DARI SINYAL ADMIN PANEL
  // ==========================================
  const executeWheelSpinAnimation = useCallback(
    (spinEvent, currentSlices) => {
      const activeSlices = currentSlices && currentSlices.length > 0 ? currentSlices : slicesRef.current;
      if (!activeSlices || activeSlices.length === 0) return;

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      isSpinningRef.current = true;
      setIsSpinning(true);
      setWinner(null);
      setShowWinnerModal(false);

      // Cari sudut target dari spinEvent yang dikirim Admin Panel
      let targetLocalAngle = Number(spinEvent.targetLocalAngle);
      let winningParticipant = spinEvent.winner || null;

      if (!isFinite(targetLocalAngle)) {
        const foundSlice =
          (winningParticipant &&
            activeSlices.find((s) => s.participant.id === winningParticipant.id)) ||
          activeSlices[0];
        targetLocalAngle = (foundSlice.startAngle + foundSlice.endAngle) / 2;
        winningParticipant = foundSlice.participant;
      }

      // Jarum berada di ATAS (270 derajat).
      // Agar targetLocalAngle berada tepat di 270 derajat saat berhenti:
      const desiredFinalMod = ((270 - targetLocalAngle) % 360 + 360) % 360;
      const startRotation = rotationRef.current;
      const currentMod = ((startRotation % 360) + 360) % 360;

      let deltaAngle = desiredFinalMod - currentMod;
      if (deltaAngle <= 0) {
        deltaAngle += 360;
      }

      const extraSpins = 9 * 360; // 9 putaran penuh
      const targetRotation = startRotation + extraSpins + deltaAngle;
      const duration = 6000; // 6 detik
      let startTime = null;

      const animate = (now) => {
        // Jika tab sedang di background saat sinyal masuk, tunggu sampai tab dilihat agar animasi 6 detik terlihat utuh
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          animFrameRef.current = requestAnimationFrame(animate);
          return;
        }
        if (startTime === null) {
          startTime = now;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubicBezier(progress);

        const currentDeg = startRotation + (targetRotation - startRotation) * eased;
        rotationRef.current = currentDeg;

        if (canvasRef.current) {
          canvasRef.current.style.transform = `rotate(${currentDeg}deg)`;
        }

        // Hitung slice yang sedang ditunjuk jarum atas (270 derajat)
        const normAngle = ((270 - (currentDeg % 360)) % 360 + 360) % 360;
        const idx = activeSlices.findIndex(
          (s) => normAngle >= s.startAngle && normAngle < s.endAngle
        );
        const resolvedIdx = idx === -1 ? activeSlices.length - 1 : idx;

        if (resolvedIdx !== -1 && resolvedIdx !== lastSliceIndexRef.current) {
          lastSliceIndexRef.current = resolvedIdx;
          if (activeSlices[resolvedIdx]) {
            setPointedName(activeSlices[resolvedIdx].participant.username);
          }
          playTickSound();
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = targetRotation;
          if (canvasRef.current) {
            canvasRef.current.style.transform = `rotate(${targetRotation}deg)`;
          }
          isSpinningRef.current = false;
          setIsSpinning(false);

          const finalNorm = ((270 - (targetRotation % 360)) % 360 + 360) % 360;
          const finalSlice =
            activeSlices.find((s) => finalNorm >= s.startAngle && finalNorm < s.endAngle) ||
            activeSlices[activeSlices.length - 1];

          const finalWinner = winningParticipant || (finalSlice ? finalSlice.participant : null);
          if (finalWinner) {
            setPointedName(finalWinner.username);
            setWinner(finalWinner);
            setShowWinnerModal(true);
            playWinSound();
          }
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [playTickSound, playWinSound]
  );

  // ==========================================
  // PROSES STATE DARI ADMIN PANEL (SUPABASE / STORAGE / BROADCAST)
  // ==========================================
  const applyRemoteState = useCallback(
    (remote, isInitialMount = false) => {
      if (!remote || typeof remote !== "object") return;

      if (remote.prizeProduct && typeof remote.prizeProduct === "object" && remote.prizeProduct.name) {
        setPrizeProduct(remote.prizeProduct);
      } else {
        setPrizeProduct(null);
      }
      if (typeof remote.prizeName === "string" && remote.prizeName.trim()) {
        const cleaned = remote.prizeName.replace(/1\.000\s*Robux\s*\/?\s*/gi, "").trim();
        setPrizeName(cleaned || remote.prizeName.trim());
      } else if (remote.prizeProduct && remote.prizeProduct.name) {
        setPrizeName(remote.prizeProduct.name);
      }

      let nextParticipants = null;
      if (Array.isArray(remote.participants)) {
        nextParticipants = remote.participants;
        setParticipants(nextParticipants);
      }

      // Hitung slices sementara jika daftar peserta ikut berubah bersamaan dengan spinEvent
      let computedSlices = slicesRef.current;
      if (nextParticipants) {
        const total = nextParticipants.reduce((s, p) => s + (Number(p.tickets) || 0), 0);
        if (total > 0) {
          let cur = 0;
          computedSlices = nextParticipants.map((p, idx) => {
            const t = Number(p.tickets) || 1;
            const deg = (t / total) * 360;
            const item = {
              participant: {
                ...p,
                color: p.color || SLICE_COLORS[idx % SLICE_COLORS.length],
              },
              startAngle: cur,
              endAngle: cur + deg,
              percentage: (t / total) * 100,
            };
            cur += deg;
            return item;
          });
        } else {
          computedSlices = [];
        }
      }

      const ev = remote.spinEvent;
      if (ev && ev.spinId) {
        let playedInSession = null;
        try {
          playedInSession = Number(sessionStorage.getItem("rockstar_played_spin_id")) || null;
        } catch {}

        const ageMs = Date.now() - (Number(ev.triggeredAt) || 0);
        const isRecent = ageMs >= -5000 && ageMs < 45000;

        if (lastProcessedSpinIdRef.current === null) {
          lastProcessedSpinIdRef.current = ev.spinId;
          if (isRecent && playedInSession !== ev.spinId) {
            try {
              sessionStorage.setItem("rockstar_played_spin_id", String(ev.spinId));
            } catch {}
            executeWheelSpinAnimation(ev, computedSlices);
          } else if (isFinite(Number(ev.targetLocalAngle))) {
            const restingDeg = ((270 - Number(ev.targetLocalAngle)) % 360 + 360) % 360;
            rotationRef.current = restingDeg;
            if (canvasRef.current) {
              canvasRef.current.style.transform = `rotate(${restingDeg}deg)`;
            }
          }
        } else if (ev.spinId !== lastProcessedSpinIdRef.current) {
          lastProcessedSpinIdRef.current = ev.spinId;
          try {
            sessionStorage.setItem("rockstar_played_spin_id", String(ev.spinId));
          } catch {}
          executeWheelSpinAnimation(ev, computedSlices);
        }
      } else if (lastProcessedSpinIdRef.current === null) {
        lastProcessedSpinIdRef.current = 0;
      }
    },
    [executeWheelSpinAnimation]
  );

  // Polling Supabase setiap 1.5 detik + Listener Instan (BroadcastChannel & localStorage)
  useEffect(() => {
    let isMounted = true;

    const fetchFromSupabase = async (isInitial = false) => {
      try {
        const res = await fetch(
          `${SB_URL}/rest/v1/info?select=deskripsi&name=eq.${encodeURIComponent(
            SPIN_STATE_KEY
          )}`,
          {
            headers: {
              apikey: SB_KEY,
              Authorization: "Bearer " + SB_KEY,
            },
            cache: "no-store",
          }
        );
        const rows = await res.json();
        if (!isMounted) return;
        if (Array.isArray(rows) && rows[0] && rows[0].deskripsi) {
          const remote = JSON.parse(rows[0].deskripsi);
          applyRemoteState(remote, isInitial);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remote));
          } catch {}
        } else if (isInitial) {
          lastProcessedSpinIdRef.current = 0;
        }
      } catch {
        if (isInitial) {
          try {
            const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localRaw) applyRemoteState(JSON.parse(localRaw), true);
          } catch {}
        }
      }
    };

    fetchFromSupabase(true);
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (isSpinningRef.current) return;
      fetchFromSupabase(false);
    }, 3000);
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && !isSpinningRef.current) {
        fetchFromSupabase(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Listener instan antar-tab di browser yang sama
    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          applyRemoteState(JSON.parse(e.newValue), false);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    let bc = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.onmessage = (msg) => {
          if (msg && msg.data) {
            applyRemoteState(msg.data, false);
          }
        };
      } catch {}
    }

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [applyRemoteState]);

  // ==========================================
  // HANDLER FORM BELI TIKET & WHATSAPP
  // ==========================================
  const handleConfirmWhatsApp = (e) => {
    e.preventDefault();
    const cleanUser = buyUsername.trim();
    if (!cleanUser || buyTicketCount < 1) return;

    const totalHarga = buyTicketCount * TICKET_PRICE;
    const message = [
      `Halo Admin Rockstar.Store, saya ingin membeli *TIKET LUCKY SPIN GRAND PRIZE*!`,
      ``,
      `👤 *Username Roblox:* ${cleanUser}`,
      `🎟️ *Jumlah Tiket:* ${buyTicketCount} Tiket`,
      `💰 *Total Harga:* ${formatRupiah(totalHarga)}`,
      ``,
      `Saya sudah/akan melakukan pembayaran. Mohon masukkan nama saya ke roda undian ya, terima kasih!`,
    ].join("\n");

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = (val, idx) => {
    navigator.clipboard.writeText(val);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#060913" />
        <title>Lucky Spin Grand Prize | Rockstar.Store</title>
        <meta
          name="description"
          content="Tiket Lucky Spin Grand Prize Rockstar.Store - Menangkan 1.000 Robux atau Secret Brainrot!"
        />
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-[#060913] text-slate-100 relative overflow-x-hidden pb-24 selection:bg-purple-600 selection:text-white">
        {/* Background Glow Ambient */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[780px] h-[420px] bg-purple-600/20 blur-[140px] rounded-full" />
          <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] bg-blue-600/15 blur-[130px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[520px] h-[420px] bg-pink-600/10 blur-[140px] rounded-full" />
        </div>

        {/* Header Navigasi Rockstar.Store */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-[#000428]/90 backdrop-blur-md border-b border-white/10">
          <a
            href="/"
            className="flex items-center gap-2.5 text-white font-extrabold tracking-wide no-underline"
          >
            <img
              src="/ROCKSTARLOGO.webp"
              alt="Rockstar.Store"
              className="h-9 w-auto rounded-lg"
            />
            <span className="text-sm sm:text-base font-black tracking-wider">
              ROCKSTAR.STORE
            </span>
          </a>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="text-xs sm:text-sm font-semibold text-blue-100 hover:text-white px-3.5 py-2 rounded-xl border border-blue-400/25 hover:border-blue-400/60 bg-white/5 transition no-underline"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-7 sm:pt-10">
          {/* ========================================== */}
          {/* 1. CARD PEMBELIAN TIKET MENCOLOK           */}
          {/* ========================================== */}
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_50px_-12px_rgba(168,85,247,0.6)] mb-9">
            <div className="bg-[#0B1022]/95 backdrop-blur-xl rounded-[22px] p-6 sm:p-10 text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-bold tracking-wider uppercase mb-4">
                <IconSparkles className="w-4 h-4 text-amber-400" />
                Event Undian Grand Prize Rockstar.Store
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-300 leading-tight">
                TIKET LUCKY SPIN GRAND PRIZE - Rp 5.000 / Tiket
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                Beli tiket langsung seharga <strong className="text-cyan-300">Rp 5.000 / Tiket</strong> atau belanja produk di Rockstar.Store untuk memenangkan hadiah utama{" "}
                <span className="text-amber-400 font-extrabold">
                  {prizeProduct?.name || prizeName}
                </span>
                !
              </p>

              {prizeProduct && prizeProduct.name && (
                <a
                  href={`/?tab=${encodeURIComponent(prizeProduct.sheet || "brainrot")}&q=${encodeURIComponent(prizeProduct.name)}#products`}
                  className="mt-5 inline-flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#060913]/90 hover:bg-[#060913] border border-amber-400/45 shadow-[0_0_25px_rgba(251,191,36,0.2)] text-left max-w-md w-full sm:w-auto no-underline transition"
                >
                  {prizeProduct.image && (
                    <img
                      src={prizeProduct.image}
                      alt={prizeProduct.name}
                      className="w-14 h-14 object-cover rounded-xl border border-amber-400/30 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      🎁 Produk Hadiah Grand Prize Saat Ini
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-white block truncate">
                      {prizeProduct.name}
                    </span>
                    <span className="text-xs text-cyan-300 font-bold block">
                      {prizeProduct.kategori ? `${prizeProduct.kategori} • ` : ""}
                      Senilai {formatRupiah(prizeProduct.price || 0)} (Klik lihat produk →)
                    </span>
                  </div>
                </a>
              )}

              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBuyModal(true)}
                    className="group relative inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] transition-all duration-200 active:scale-95 cursor-pointer border-0"
                  >
                    <IconTicket className="w-6 h-6" />
                    BELI TIKET LANGSUNG (Rp 5.000 / Tiket)
                  </button>

                  <a
                    href="/?tab=brainrot#products"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#131F3A] hover:bg-[#1A2B50] border border-cyan-400/40 text-cyan-200 font-extrabold text-sm sm:text-base no-underline transition active:scale-95"
                  >
                    🛒 BELANJA PRODUK (Min. Rp 50,000 Gratis 1 Tiket)
                  </a>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href="/?tab=brainrot#products"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/35 text-purple-200 text-xs font-bold no-underline transition"
                  >
                    🧠 Katalog Item Brainrot
                  </a>
                  <a
                    href="/?tab=akun#products"
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/35 text-cyan-200 text-xs font-bold no-underline transition"
                  >
                    👤 Katalog Akun Sepuh
                  </a>
                  <a
                    href="/?tab=joki#products"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/35 text-amber-200 text-xs font-bold no-underline transition"
                  >
                    🏆 Katalog Jasa Joki
                  </a>
                </div>

                <p className="mt-3 text-xs opacity-60 max-w-xl mx-auto leading-relaxed">
                  *Minimal Belanja Rp 50,000 / Tiket (Berlaku untuk pembelian produk di Rockstar.Store, kecuali katalog Top Up Robux) otomatis mendapatkan 1x Kupon Spin Grand Prize
                </p>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 2. RODA SPIN INTERAKTIF & TABEL PESERTA    */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Area Roda Spin */}
            <div className="lg:col-span-7 flex flex-col items-center bg-[#0E1628]/85 border border-blue-400/20 rounded-3xl p-5 sm:p-8 backdrop-blur-md shadow-2xl relative">
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#060913]/90 border border-slate-800">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSpinning ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  <span className="text-xs text-slate-400 font-medium">Jarum Menunjuk:</span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-400 truncate max-w-[140px] sm:max-w-[220px]">
                    {pointedName}
                  </span>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
                  className="p-2.5 rounded-xl bg-[#060913]/90 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {soundEnabled ? (
                    <IconVolume2 className="w-4 h-4" />
                  ) : (
                    <IconVolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Canvas Roda + Indikator Jarum di Atas */}
              <div className="relative flex items-center justify-center my-2">
                {/* Jarum Penunjuk di Bagian Atas (270 derajat) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.85)]">
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[34px] border-t-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-white absolute -top-[30px] left-1/2 -translate-x-1/2" />
                </div>

                <canvas
                  ref={canvasRef}
                  style={{ willChange: "transform" }}
                  className="w-[300px] h-[300px] sm:w-[430px] sm:h-[430px] rounded-full shadow-[0_0_60px_rgba(43,78,255,0.28)]"
                />
              </div>

              {isSpinning && (
                <div className="mt-5 w-full max-w-xs text-center">
                  <div className="w-full py-3 px-5 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 border bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-amber-400 animate-ping" />
                    🎡 RODA SEDANG BERPUTAR...
                  </div>
                </div>
              )}
            </div>

            {/* Tabel Daftar Peserta & Total Tiket */}
            <div className="lg:col-span-5 bg-[#0E1628]/85 border border-blue-400/20 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                    <IconUsers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white m-0">Daftar Peserta & Tiket</h2>
                    <p className="text-xs text-slate-400 m-0">
                      Lebar potongan sesuai jumlah tiket
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Kupon</span>
                  <span className="text-xl font-black text-amber-400">{totalTickets} Tiket</span>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[430px] pr-1">
                {slices.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Belum ada peserta di kloter ini.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 pl-2">#</th>
                        <th className="py-2.5">Username Roblox</th>
                        <th className="py-2.5 text-center">Tiket</th>
                        <th className="py-2.5 text-right pr-2">Peluang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {[...slices]
                        .sort((a, b) => b.participant.tickets - a.participant.tickets)
                        .map((item, idx) => (
                          <tr
                            key={item.participant.id}
                            className="hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 pl-2 font-bold text-slate-400 text-xs">
                              {idx + 1}
                            </td>
                            <td className="py-3 font-semibold text-white flex items-center gap-2.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: item.participant.color }}
                              />
                              <span className="truncate max-w-[140px] sm:max-w-[175px]">
                                {item.participant.username}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                {item.participant.tickets}x
                              </span>
                            </td>
                            <td className="py-3 text-right pr-2 font-mono text-xs text-cyan-400 font-bold">
                              {item.percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ========================================== */}
        {/* MODAL 1: FORM BELI TIKET                   */}
        {/* ========================================== */}
        {showBuyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0E1628] border border-blue-400/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-[0_0_60px_rgba(168,85,247,0.3)] max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setShowBuyModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border-0"
              >
                <IconX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <IconTicket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white m-0">Beli Tiket Lucky Spin</h3>
                  <p className="text-xs text-slate-400 m-0">
                    Rp 5.000 / Tiket (Tanpa Beli Produk) • Bebas Tanpa Batas
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmWhatsApp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Username Roblox
                  </label>
                  <input
                    type="text"
                    required
                    value={buyUsername}
                    onChange={(e) => setBuyUsername(e.target.value)}
                    placeholder="Contoh: BrainrotKing99"
                    className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Jumlah Tiket (Bebas Tanpa Batas)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={buyTicketCount}
                    onChange={(e) =>
                      setBuyTicketCount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {[1, 3, 5, 10, 25].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setBuyTicketCount(num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          buyTicketCount === num
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-[#060913] border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {num} Tiket
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#060913] border border-purple-500/35 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Harga</span>
                    <span className="text-xs text-purple-300">
                      {buyTicketCount} Tiket × Rp 5.000
                    </span>
                  </div>
                  <span className="text-2xl font-black text-amber-400">
                    {formatRupiah(buyTicketCount * TICKET_PRICE)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-xs text-emerald-200 leading-relaxed">
                  💡 <strong>Catatan:</strong> Bisa bayar di sini langsung lalu kirim bukti ke WA Admin, atau bisa juga minta payment di WA Admin — <strong>langsung tekan Konfirmasi via WhatsApp aja!</strong>
                </div>

                <div className="space-y-2.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Instruksi Pembayaran Manual (QRIS / DANA / GoPay):
                  </span>
                  {PAYMENT_METHODS.map((pm, idx) => (
                    <div
                      key={pm.name}
                      className="p-3 rounded-xl bg-[#060913] border border-slate-800 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={pm.logo}
                          alt={pm.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1"
                        />
                        <div>
                          <span className="font-extrabold text-cyan-400 block">{pm.name}</span>
                          <span className="text-slate-300 text-[11px]">{pm.info}</span>
                        </div>
                      </div>

                      {pm.qrisImage ? (
                        <button
                          type="button"
                          onClick={() => setShowQrisPreview(!showQrisPreview)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-bold cursor-pointer shrink-0"
                        >
                          {showQrisPreview ? "Tutup QR" : "Lihat QRIS"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCopy(pm.copyValue, idx)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Disalin</span>
                            </>
                          ) : (
                            <>
                              <IconCopy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}

                  {showQrisPreview && (
                    <div className="p-3.5 rounded-xl bg-[#060913] border border-purple-500/35 text-center">
                      <img
                        src="/qris-rockstar-spin.jpg"
                        alt="QRIS Rockstar.Store - ROCKSTAR.STORE, DIGITAL & KREATIF"
                        className="max-w-[240px] w-full mx-auto rounded-lg border border-white/15 shadow-lg"
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <a
                          href="/qris-rockstar-spin.jpg"
                          download="QRIS-RockstarStore.jpg"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-xs no-underline shadow-md transition"
                        >
                          ⬇️ Download Foto QRIS
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 mb-0">
                        Scan / Download QRIS di atas lalu kirimkan bukti pembayaran ke WhatsApp Admin.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition cursor-pointer border-0"
                >
                  <IconWhatsApp className="w-5 h-5" />
                  Konfirmasi via WhatsApp
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL 2: POP-UP PENGUMUMAN PEMENANG        */}
        {/* ========================================== */}
        {showWinnerModal && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0E1628] border-2 border-amber-400 rounded-3xl max-w-md w-full p-8 text-center relative shadow-[0_0_80px_rgba(251,191,36,0.35)]">
              <div className="mx-auto w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.5)] text-amber-400">
                <IconTrophy className="w-10 h-10 animate-bounce" />
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">
                🎉 Pemenang Lucky Spin Grand Prize 🎉
              </span>
              <h3 className="text-3xl font-black text-white break-words mt-1 mb-2">
                {winner.username}
              </h3>
              <p className="text-xs text-slate-300 m-0">
                Berhasil menang dengan kepemilikan{" "}
                <span className="text-purple-400 font-bold">{winner.tickets} Tiket</span>!
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-[#060913] border border-slate-800 text-xs text-slate-300">
                Grand Prize:{" "}
                <strong className="text-amber-400">{prizeProduct?.name || prizeName}</strong>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition cursor-pointer border-0"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
