const MONITORED_GAMES = [
  { universeId: 10563114921, placeId: 107778070777162, name: "Steal An Egg" },
  { universeId: 66654135, placeId: 142823291, name: "Murder Mystery 2" },
  { universeId: 994732206, placeId: 2753915549, name: "Blox Fruits" },
  { universeId: 1686885941, placeId: 4924922222, name: "Brookhaven RP" },
  { universeId: 6035872082, placeId: 17625359962, name: "RIVALS" },
  { universeId: 5750914919, placeId: 16732694052, name: "Fisch" },
  { universeId: 3317771874, placeId: 8737899170, name: "Pet Simulator 99" },
  { universeId: 5203828273, placeId: 15101393044, name: "Dress To Impress" },
  { universeId: 5578556129, placeId: 16146832113, name: "Anime Vanguards" },
  { universeId: 2619619496, placeId: 6872265039, name: "BedWars" },
  { universeId: 4777817887, placeId: 13772394625, name: "Blade Ball" },
  { universeId: 3803884814, placeId: 10449761463, name: "The Strongest Battlegrounds" },
  { universeId: 982551538, placeId: 2788229376, name: "Da Hood" },
  { universeId: 352762923, placeId: 920587237, name: "Adopt Me!" },
];

const FALLBACK_TOP10 = [
  { rank: 1, name: "Steal An Egg", playing: 885000, placeId: "107778070777162", url: "https://www.roblox.com/games/107778070777162", icon: "/STEAL%20A%20EGG%20DISPLAY.webp" },
  { rank: 2, name: "Murder Mystery 2", playing: 412000, placeId: "142823291", url: "https://www.roblox.com/games/142823291", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 3, name: "Blox Fruits", playing: 265000, placeId: "2753915549", url: "https://www.roblox.com/games/2753915549", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 4, name: "Brookhaven RP", playing: 260000, placeId: "4924922222", url: "https://www.roblox.com/games/4924922222", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 5, name: "RIVALS", playing: 124000, placeId: "17625359962", url: "https://www.roblox.com/games/17625359962", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 6, name: "Fisch", playing: 55000, placeId: "16732694052", url: "https://www.roblox.com/games/16732694052", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 7, name: "Pet Simulator 99", playing: 46000, placeId: "8737899170", url: "https://www.roblox.com/games/8737899170", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 8, name: "Dress To Impress", playing: 33000, placeId: "15101393044", url: "https://www.roblox.com/games/15101393044", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 9, name: "Anime Vanguards", playing: 26000, placeId: "16146832113", url: "https://www.roblox.com/games/16146832113", icon: "/optimized/ROCKSTARLOGO-72.webp" },
  { rank: 10, name: "BedWars", playing: 15000, placeId: "6872265039", url: "https://www.roblox.com/games/6872265039", icon: "/optimized/ROCKSTARLOGO-72.webp" },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  try {
    const uids = MONITORED_GAMES.map((g) => g.universeId).join(",");
    const placeMap = Object.fromEntries(MONITORED_GAMES.map((g) => [g.universeId, g.placeId]));
    const customNameMap = Object.fromEntries(MONITORED_GAMES.map((g) => [g.universeId, g.name]));

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    };

    const [gamesRes, iconsRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${uids}`, { headers, signal: AbortSignal.timeout(4000) }),
      fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${uids}&size=150x150&format=WebP&isCircular=false`, { headers, signal: AbortSignal.timeout(4000) }),
    ]);

    if (!gamesRes.ok) {
      throw new Error(`Roblox API returned status ${gamesRes.status}`);
    }

    const gamesJson = await gamesRes.json();
    let iconsMap = {};
    if (iconsRes.ok) {
      const iconsJson = await iconsRes.json();
      iconsMap = Object.fromEntries(
        (iconsJson.data || []).map((item) => [item.targetId, item.imageUrl])
      );
    }

    const games = (gamesJson.data || []).map((g) => {
      const pid = placeMap[g.id] || g.rootPlaceId;
      // Clean emoji-heavy title if available in customNameMap or simplify
      let cleanName = customNameMap[g.id] || g.name || "Roblox Game";
      return {
        universeId: g.id,
        placeId: pid,
        name: cleanName,
        rawName: g.name,
        playing: Number(g.playing) || 0,
        visits: Number(g.visits) || 0,
        icon: iconsMap[g.id] || "/optimized/ROCKSTARLOGO-72.webp",
        url: `https://www.roblox.com/games/${pid}`,
      };
    });

    // Peringkat otomatis berdasarkan jumlah pemain terbanyak (live playing descending)
    games.sort((a, b) => b.playing - a.playing);
    const top10 = games.slice(0, 10).map((g, idx) => ({
      rank: idx + 1,
      ...g,
    }));

    return res.status(200).json({
      success: true,
      updatedAt: Date.now(),
      data: top10,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      fallback: true,
      updatedAt: Date.now(),
      data: FALLBACK_TOP10,
    });
  }
}
