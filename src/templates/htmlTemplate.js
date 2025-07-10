import { baseCSS } from "./cssTemplate.js";

export function generateSkeletonHTML() {
  return `
    <html>
    <head>
      <title>VolumeChecker</title>
      <style>${baseCSS}</style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo">LOGO</div>
          <button id="updateButton" class="update-btn">Verileri Güncelle 🔄</button>
        </header>

        <h2>🚀 Top 20 Artış</h2>
        <div id="upTable">Yükleniyor...</div>

        <h2>🔻 Top 20 Düşüş</h2>
        <div id="downTable">Yükleniyor...</div>
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

        async function loadData() {
          const res = await fetch("/api/data");
          const data = await res.json();

          function buildTable(coins) {
            let html = '<table><tr><th>Coin</th><th>Ticker</th><th>Fiyat ($)</th><th>MCap</th><th>Volume</th><th>Değişim %</th><th>Tarih</th><th>Coingecko</th></tr>';
            for (const coin of coins) {
              const changeClass = coin.change >= 0 ? "green" : "red";
              const coingeckoUrl = "https://www.coingecko.com/en/coins/" + coin.coin_id;
              html += \`<tr>
                <td>\${coin.coin_name}</td>
                <td>\${coin.ticker}</td>
                <td>\${coin.price.toFixed(2)}</td>
                <td>\${coin.market_cap.toLocaleString()}</td>
                <td>\${coin.volume.toLocaleString()}</td>
                <td class="\${changeClass}">\${coin.change.toFixed(2)}%</td>
                <td>\${coin.created_at}</td>
                <td><a href="\${coingeckoUrl}" target="_blank">🔗</a></td>
              </tr>\`;
            }
            html += '</table>';
            return html;
          }

          document.getElementById("upTable").innerHTML = buildTable(data.sortedUp);
          document.getElementById("downTable").innerHTML = buildTable(data.sortedDown);
        }

        loadData();
      </script>
    </body>
    </html>
  `;
}
