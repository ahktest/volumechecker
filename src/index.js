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
      body {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f1f1f1;
      }
      .container {
        max-width: 1200px;
        margin: 40px auto;
        padding: 30px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }
      .logo {
        height: 50px;
        width: 150px;
        background-color: #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-weight: bold;
        color: #333;
      }
      .update-btn {
        padding: 12px 20px;
        font-size: 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }
      .update-btn:hover:not([disabled]) {
        background-color: #0056b3;
      }
      .update-btn[disabled] {
        background-color: #aaa;
        cursor: not-allowed;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 40px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }
      th {
        background-color: #f8f8f8;
        font-weight: bold;
      }
      .green {
        color: green;
        font-weight: bold;
      }
      .red {
        color: red;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <div class="logo">LOGO</div>
        <button id="updateButton" class="update-btn">Verileri Güncelle 🔄</button>
      </header>

      <h2>🚀 Top 20 Artış</h2>
      ${renderTable(sortedUp)}

      <h2>🔻 Top 20 Düşüş</h2>
      ${renderTable(sortedDown)}
    </div>

    <script>
      const button = document.getElementById("updateButton");

      button.addEventListener("click", async () => {
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = "Güncelleniyor...";

        try {
          const res = await fetch("?action=update");
          if (res.ok) {
            alert("✅ Veriler başarıyla güncellendi!");
            location.reload();
          } else {
            const text = await res.text();
            alert("❌ Hata: " + text);
            button.disabled = false;
            button.textContent = originalText;
          }
        } catch (e) {
          alert("❌ Beklenmeyen hata: " + e.message);
          button.disabled = false;
          button.textContent = originalText;
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
