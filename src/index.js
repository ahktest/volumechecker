// worker.js
import { fetchAndStoreCoins } from './fetchAndStore.js';
import { generateSkeletonHTML } from './templates/htmlTemplate.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "update") {
      try {
        const count = await fetchAndStoreCoins(env);
        return new Response(`✅ ${count} coin güncellendi.`, { status: 200 });
      } catch (error) {
        console.error("Update action error:", error);
        return new Response(`❌ Hata: ${error.message}`, { status: 500 });
      }
    }

    if (url.pathname === "/api/data") {
      const allRows = await env.DB
        .prepare(`SELECT * FROM coins ORDER BY id DESC LIMIT 1000`)
        .all();

      if (allRows.results.length < 1000) {
        return new Response(JSON.stringify({ sortedUp: [], sortedDown: [], newComers: [] }), {
          headers: { "content-type": "application/json" },
        });
      }

      const latestSnapshot = allRows.results.slice(0, 500);
      const prevSnapshot = allRows.results.slice(500, 1000);

      const prevMap = new Map();
      for (const coin of prevSnapshot) {
        prevMap.set(coin.coin_id, coin.volume);
      }

      const coinsWithChange = latestSnapshot.map((coin) => {
        const oldVol = prevMap.get(coin.coin_id);
        const change = oldVol ? ((coin.volume - oldVol) / (oldVol || 1)) * 100 : 0;

        return {
          ...coin,
          volume_change: change,
          prev_volume: oldVol ?? null,
        };
      });

      const sortedUp = coinsWithChange
        .filter(c => c.prev_volume !== null && c.volume_change > 0)
        .sort((a, b) => b.volume_change - a.volume_change)
        .slice(0, 20);

      const sortedDown = coinsWithChange
        .filter(c => c.prev_volume !== null && c.volume_change < 0)
        .sort((a, b) => a.volume_change - b.volume_change)
        .slice(0, 20);

      const newComers = coinsWithChange.filter(c => c.prev_volume === null);

      return new Response(JSON.stringify({ sortedUp, sortedDown, newComers }), {
        headers: { "content-type": "application/json" },
      });
    }

    const html = generateSkeletonHTML();
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  async scheduled(event, env, ctx) {
    await fetchAndStoreCoins(env);
  },
};
