import { fetchAndStoreCoins } from './fetchAndStore.js';
import { calculateChange, renderTable } from './renderTable.js';

export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "update") {
      try {
        const count = await fetchAndStoreCoins(env);
        return new Response(`✅ ${count} coin güncellendi.`, { status: 200 });
      } catch (error) {
        return new Response(`❌ Hata: ${error.message}`, { status: 500 });
      }
    }

    // Son kayıtları çek
    const sql = `
      SELECT c1.*
      FROM coins c1
      INNER JOIN (
        SELECT coin_id, MAX(created_at) AS max_created
        FROM coins
        GROUP BY coin_id
      ) latest
      ON c1.coin_id = latest.coin_id AND c1.created_at = latest.max_created
    `;
    const { results } = await env.DB.prepare(sql).all();

    const coinsWithChange = [];
    for (const coin of results) {
      const oldRow = await env.DB.prepare(
        `SELECT price FROM coins WHERE coin_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT 1`
      ).bind(coin.coin_id, coin.created_at).first();

      const oldPrice = oldRow ? oldRow.price : 0;
      const change = calculateChange(oldPrice, coin.price);
      coinsWithChange.push({ ...coin, change });
    }

    const sortedUp = [...coinsWithChange].sort((a, b) => b.change - a.change).slice(0, 20);
    const sortedDown = [...coinsWithChange].sort((a, b) => a.change - b.change).slice(0, 20);

    let html = `
  <html>
  <head>
    <title>VolumeChecker</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .green { color: green; font-weight: bold; }
      .red { color: red; font-weight: bold; }
      button { padding: 10px 20px; font-size: 16px; }
    </style>
  </head>
  <body>
    <h1>📊 VolumeChecker - Top 20 Artış & Düşüş</h1>

    <button id="updateButton">Verileri Güncelle 🔄</button>

    <h2>🚀 Top 20 Artış</h2>
    ${renderTable(sortedUp)}

    <h2>🔻 Top 20 Düşüş</h2>
    ${renderTable(sortedDown)}

    <script>
      document.getElementById("updateButton").addEventListener("click", async () => {
        try {
          const res = await fetch("?action=update");
          if (res.ok) {
            alert("✅ Veriler başarıyla güncellendi!");
            location.reload();
          } else {
            const text = await res.text();
            alert("❌ Hata: " + text);
          }
        } catch (e) {
          alert("❌ Beklenmeyen hata: " + e.message);
        }
      });
    </script>
  </body>
  </html>
`;


    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  async scheduled(event, env, ctx) {
    try {
      const count = await fetchAndStoreCoins(env);
      console.log(`✅ Cron: ${count} coin kayıt edildi.`);
    } catch (error) {
      console.error(`❌ Cron hata: ${error.message}`);
    }
  },
};
