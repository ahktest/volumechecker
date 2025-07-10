import { fetchAndStoreCoins } from './fetchAndStore.js';
import { generateSkeletonHTML } from './templates/htmlTemplate.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // Verileri güncelle butonuna tıklanınca çalışır
    if (action === "update") {
      try {
        const count = await fetchAndStoreCoins(env);
        return new Response(`✅ ${count} coin güncellendi.`, { status: 200 });
      } catch (error) {
        return new Response(`❌ Hata: ${error.message}`, { status: 500 });
      }
    }

    // API endpoint: JSON veri döner
    if (url.pathname === "/api/data") {
      const sql = `
        SELECT c1.*, 
               (
                  SELECT price
                  FROM coins c2
                  WHERE c2.coin_id = c1.coin_id 
                    AND c2.created_at < c1.created_at
                  ORDER BY c2.created_at DESC
                  LIMIT 1
               ) AS old_price
        FROM coins c1
        INNER JOIN (
            SELECT coin_id, MAX(created_at) AS max_created
            FROM coins
            GROUP BY coin_id
        ) latest
        ON c1.coin_id = latest.coin_id AND c1.created_at = latest.max_created
      `;
      const { results } = await env.DB.prepare(sql).all();

      const coinsWithChange = results.map((coin) => {
        const oldPrice = coin.old_price || 0;
        const change = ((coin.price - oldPrice) / (oldPrice || 1)) * 100;
        return { ...coin, change };
      });

      const sortedUp = [...coinsWithChange].sort((a, b) => b.change - a.change).reverse().slice(0, 20);
      const sortedDown = [...coinsWithChange].sort((a, b) => a.change - b.change).slice(0, 20);

      return new Response(JSON.stringify({ sortedUp, sortedDown }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Ana sayfa: dummy tablo + script
    const html = generateSkeletonHTML();
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  async scheduled(event, env, ctx) {
    await fetchAndStoreCoins(env);
  },
};
