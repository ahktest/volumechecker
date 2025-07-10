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
        return new Response(JSON.stringify({ data: [] }), {
          headers: { "content-type": "application/json" },
        });
      }

      const latestSnapshot = allRows.results.slice(0, 500);
      const prevSnapshot = allRows.results.slice(500, 1000);

      const prevMap = new Map();
      for (const coin of prevSnapshot) {
        if (!prevMap.has(coin.ticker)) {
          prevMap.set(coin.ticker, coin);
        }
      }

      const mergedData = latestSnapshot.map((latestCoin) => {
        const prevCoin = prevMap.get(latestCoin.ticker);

        const volume_change = prevCoin
          ? ((latestCoin.volume - prevCoin.volume) / (prevCoin.volume || 1)) * 100
          : null;

        return {
          coin_name: latestCoin.coin_name,
          ticker: latestCoin.ticker,
          price: latestCoin.price,
          market_cap: latestCoin.market_cap,
          volume: latestCoin.volume,
          volume_change,
          created_at: latestCoin.created_at,
          prev_time: prevCoin ? prevCoin.created_at : null,
          prev_price: prevCoin ? prevCoin.price : null,
          prev_market_cap: prevCoin ? prevCoin.market_cap : null,
          prev_volume: prevCoin ? prevCoin.volume : null,
          coin_id: latestCoin.coin_id,
        };
      });

      const sortedUp = mergedData
        .filter(c => c.volume_change !== null && c.volume_change > 0)
        .sort((a, b) => b.volume_change - a.volume_change)
        .slice(0, 20);

      const sortedDown = mergedData
        .filter(c => c.volume_change !== null && c.volume_change < 0)
        .sort((a, b) => a.volume_change - b.volume_change)
        .slice(0, 20);

      const newComers = mergedData.filter(c => c.volume_change === null);

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