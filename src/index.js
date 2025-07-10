import { fetchAndStoreCoins } from './fetchAndStore.js';
import { generateSkeletonHTML } from './templates/htmlTemplate.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // Güncelleme butonu
    if (action === "update") {
      try {
        const count = await fetchAndStoreCoins(env);
        return new Response(`✅ ${count} coin güncellendi.`, { status: 200 });
      } catch (error) {
        return new Response(`❌ Hata: ${error.message}`, { status: 500 });
      }
    }

    // API endpoint
    if (url.pathname === "/api/data") {
      const latestSnapshot = await env.DB.prepare(`
        SELECT created_at
        FROM coins
        ORDER BY created_at DESC
        LIMIT 1
      `).first();

      if (!latestSnapshot) {
        return new Response(JSON.stringify({ sortedUp: [], sortedDown: [], newComers: [] }));
      }

      const latestTime = latestSnapshot.created_at;

      const allLatestCoins = await env.DB.prepare(`
        SELECT c1.*, 
               (
                  SELECT volume
                  FROM coins c2
                  WHERE c2.coin_id = c1.coin_id 
                    AND c2.created_at < c1.created_at
                  ORDER BY c2.created_at DESC
                  LIMIT 1
               ) AS old_volume,
               (
                  SELECT created_at
                  FROM coins c2
                  WHERE c2.coin_id = c1.coin_id 
                    AND c2.created_at < c1.created_at
                  ORDER BY c2.created_at DESC
                  LIMIT 1
               ) AS prev_time
        FROM coins c1
        WHERE c1.created_at = ?
      `).bind(latestTime).all();

      const coinsWithChange = allLatestCoins.results.map((coin) => {
        const oldVol = coin.old_volume;
        const change = oldVol ? ((coin.volume - oldVol) / (oldVol || 1)) * 100 : 0;
        return {
          ...coin,
          volume_change: change,
          prev_time: coin.prev_time || "Yok"
        };
      });

      const sortedUp = coinsWithChange
        .filter(c => c.prev_time !== "Yok")
        .sort((a, b) => b.volume_change - a.volume_change)
        .slice(0, 20);

      const sortedDown = coinsWithChange
        .filter(c => c.prev_time !== "Yok")
        .sort((a, b) => a.volume_change - b.volume_change)
        .slice(0, 20);

      const newComers = coinsWithChange.filter(c => c.prev_time === "Yok");

      return new Response(JSON.stringify({ sortedUp, sortedDown, newComers }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Ana sayfa
    const html = generateSkeletonHTML();
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  async scheduled(event, env, ctx) {
    await fetchAndStoreCoins(env);
  },
};
