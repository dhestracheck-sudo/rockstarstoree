const MONITORED_GAMES = [
  {
    universeId: 10563114921,
    placeId: 107778070777162,
    name: "Steal An Egg",
    icon: "https://tr.rbxcdn.com/180DAY-910355fa3ecc8a4524e0ffa7a55707a3/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 66654135,
    placeId: 142823291,
    name: "Murder Mystery 2",
    icon: "https://tr.rbxcdn.com/180DAY-ab1484ff8063476d413da09dd25df93f/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 994732206,
    placeId: 2753915549,
    name: "Blox Fruits",
    icon: "https://tr.rbxcdn.com/180DAY-8c9483d381a2da30608e6b1bce490bef/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 1686885941,
    placeId: 4924922222,
    name: "Brookhaven RP",
    icon: "https://tr.rbxcdn.com/180DAY-59e7f600e77655f8507846254b461a8b/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 6035872082,
    placeId: 17625359962,
    name: "RIVALS",
    icon: "https://tr.rbxcdn.com/180DAY-1912e777e949b6490e59fa4ac83b1063/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 5750914919,
    placeId: 16732694052,
    name: "Fisch",
    icon: "https://tr.rbxcdn.com/180DAY-54c595481b689170c73c9993a83feed3/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 3317771874,
    placeId: 8737899170,
    name: "Pet Simulator 99",
    icon: "https://tr.rbxcdn.com/180DAY-90f12c7dfe5fe57a391edf5e44bb72c5/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 5203828273,
    placeId: 15101393044,
    name: "Dress To Impress",
    icon: "https://tr.rbxcdn.com/180DAY-929ff39bc1d926f3de0298cdf3470b41/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 5578556129,
    placeId: 16146832113,
    name: "Anime Vanguards",
    icon: "https://tr.rbxcdn.com/180DAY-f7bdd44dd0cde82613d28a99098e9329/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 2619619496,
    placeId: 6872265039,
    name: "BedWars",
    icon: "https://tr.rbxcdn.com/180DAY-f183ab72f37afda4898e900235134b60/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 4777817887,
    placeId: 13772394625,
    name: "Blade Ball",
    icon: "https://tr.rbxcdn.com/180DAY-38e75c9ff1051ad6ca868f39be2cf095/150/150/Image/Webp/noFilter",
  },
  {
    universeId: 3803884814,
    placeId: 10449761463,
    name: "The Strongest Battlegrounds",
    icon: "https://tr.rbxcdn.com/180DAY-26de3a6f3be928df6691f27dc32575c9/150/150/GameIcon3/Webp/noFilter",
  },
  {
    universeId: 352762923,
    placeId: 920587237,
    name: "Adopt Me!",
    icon: "https://tr.rbxcdn.com/180DAY-26de3a6f3be928df6691f27dc32575c9/150/150/GameIcon4/Webp/noFilter",
  },
];

const FALLBACK_TOP10 = [
  {
    rank: 1,
    name: "Steal An Egg",
    playing: 885000,
    placeId: "107778070777162",
    url: "https://www.roblox.com/games/107778070777162",
    icon: "https://tr.rbxcdn.com/180DAY-910355fa3ecc8a4524e0ffa7a55707a3/150/150/Image/Webp/noFilter",
  },
  {
    rank: 2,
    name: "Murder Mystery 2",
    playing: 412000,
    placeId: "142823291",
    url: "https://www.roblox.com/games/142823291",
    icon: "https://tr.rbxcdn.com/180DAY-ab1484ff8063476d413da09dd25df93f/150/150/Image/Webp/noFilter",
  },
  {
    rank: 3,
    name: "Blox Fruits",
    playing: 265000,
    placeId: "2753915549",
    url: "https://www.roblox.com/games/2753915549",
    icon: "https://tr.rbxcdn.com/180DAY-8c9483d381a2da30608e6b1bce490bef/150/150/Image/Webp/noFilter",
  },
  {
    rank: 4,
    name: "Brookhaven RP",
    playing: 260000,
    placeId: "4924922222",
    url: "https://www.roblox.com/games/4924922222",
    icon: "https://tr.rbxcdn.com/180DAY-59e7f600e77655f8507846254b461a8b/150/150/Image/Webp/noFilter",
  },
  {
    rank: 5,
    name: "RIVALS",
    playing: 124000,
    placeId: "17625359962",
    url: "https://www.roblox.com/games/17625359962",
    icon: "https://tr.rbxcdn.com/180DAY-1912e777e949b6490e59fa4ac83b1063/150/150/Image/Webp/noFilter",
  },
  {
    rank: 6,
    name: "Fisch",
    playing: 55000,
    placeId: "16732694052",
    url: "https://www.roblox.com/games/16732694052",
    icon: "https://tr.rbxcdn.com/180DAY-54c595481b689170c73c9993a83feed3/150/150/Image/Webp/noFilter",
  },
  {
    rank: 7,
    name: "Pet Simulator 99",
    playing: 46000,
    placeId: "8737899170",
    url: "https://www.roblox.com/games/8737899170",
    icon: "https://tr.rbxcdn.com/180DAY-90f12c7dfe5fe57a391edf5e44bb72c5/150/150/Image/Webp/noFilter",
  },
  {
    rank: 8,
    name: "Dress To Impress",
    playing: 33000,
    placeId: "15101393044",
    url: "https://www.roblox.com/games/15101393044",
    icon: "https://tr.rbxcdn.com/180DAY-929ff39bc1d926f3de0298cdf3470b41/150/150/Image/Webp/noFilter",
  },
  {
    rank: 9,
    name: "Anime Vanguards",
    playing: 26000,
    placeId: "16146832113",
    url: "https://www.roblox.com/games/16146832113",
    icon: "https://tr.rbxcdn.com/180DAY-f7bdd44dd0cde82613d28a99098e9329/150/150/Image/Webp/noFilter",
  },
  {
    rank: 10,
    name: "BedWars",
    playing: 15000,
    placeId: "6872265039",
    url: "https://www.roblox.com/games/6872265039",
    icon: "https://tr.rbxcdn.com/180DAY-f183ab72f37afda4898e900235134b60/150/150/Image/Webp/noFilter",
  },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  try {
    const uids = MONITORED_GAMES.map((g) => g.universeId).join(",");
    const placeMap = Object.fromEntries(MONITORED_GAMES.map((g) => [g.universeId, g.placeId]));
    const customNameMap = Object.fromEntries(MONITORED_GAMES.map((g) => [g.universeId, g.name]));
    const defaultIconMap = Object.fromEntries(MONITORED_GAMES.map((g) => [g.universeId, g.icon]));

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    };

    const [gamesRes, iconsRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${uids}`, { headers, signal: AbortSignal.timeout(5000) }),
      fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${uids}&size=150x150&format=WebP&isCircular=false`, { headers, signal: AbortSignal.timeout(5000) }),
    ]);

    if (!gamesRes.ok) {
      throw new Error(`Roblox API returned status ${gamesRes.status}`);
    }

    const gamesJson = await gamesRes.json();
    let iconsMap = {};
    if (iconsRes.ok) {
      try {
        const iconsJson = await iconsRes.json();
        iconsMap = Object.fromEntries(
          (iconsJson.data || [])
            .filter((item) => item.imageUrl && item.state === "Completed")
            .map((item) => [item.targetId, item.imageUrl])
        );
      } catch (e) {}
    }

    const games = (gamesJson.data || []).map((g) => {
      const pid = placeMap[g.id] || g.rootPlaceId;
      let cleanName = customNameMap[g.id] || g.name || "Roblox Game";
      const icon = iconsMap[g.id] || defaultIconMap[g.id] || "https://tr.rbxcdn.com/180DAY-910355fa3ecc8a4524e0ffa7a55707a3/150/150/Image/Webp/noFilter";
      return {
        universeId: g.id,
        placeId: pid,
        name: cleanName,
        rawName: g.name,
        playing: Number(g.playing) || 0,
        visits: Number(g.visits) || 0,
        icon,
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
