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
      const snapshotTimes = await env.DB.prepare(`
        SELECT DISTINCT created_at
        FROM coins
        ORDER BY created_at DESC
        LIMIT 2
      `).all();

      if (snapshotTimes.results.length < 1) {
        return new Response(JSON.stringify({ sortedUp: [], sortedDown: [], newComers: [] }));
      }

      const latestTime = snapshotTimes.results[0].created_at;
      const prevTime = snapshotTimes.results[1]?.created_at;

      const latestCoins = await env.DB.prepare(`
        SELECT *
        FROM coins
        WHERE created_at = ?
      `).bind(latestTime).all();

      const coinsWithChange = [];

      for (const coin of latestCoins.results) {
        let oldVolumeRow = null;

        if (prevTime) {
          oldVolumeRow = await env.DB.prepare(`
            SELECT volume
            FROM coins
            WHERE coin_id = ?
              AND created_at = ?
          `).bind(coin.coin_id, prevTime).first();
        }

        let changePct = 0;
        let isNew = true;

        if (oldVolumeRow) {
          const oldVol = oldVolumeRow.volume;
          changePct = ((coin.volume - oldVol) / (oldVol || 1)) * 100;
          isNew = false;
        }

        coinsWithChange.push({
          ...coin,
          volume_change: changePct,
          isNew,
          prev_time: oldVolumeRow ? prevTime : "Yok"
        });
      }

      const sortedUp = coinsWithChange
        .filter(c => !c.isNew && c.volume_change > 0)
        .sort((a, b) => b.volume_change - a.volume_change)
        .slice(0, 20);

      const sortedDown = coinsWithChange
        .filter(c => !c.isNew && c.volume_change < 0)
        .sort((a, b) => a.volume_change - b.volume_change)
        .slice(0, 20);

      const newComers = coinsWithChange.filter(c => c.isNew);

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
