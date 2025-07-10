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

        <h2>✨ Son 6 saatte ilk 500'e girenler</h2>
        <div id="newComersTable">Yükleniyor...</div>
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

        // Sayı formatlama fonksiyonu
        function formatNumber(n) {
          if (n >= 1_000_000_000) {
            return (n / 1_000_000_000).toFixed(2) + "B";
          } else if (n >= 1_000_000) {
            return (n / 1_000_000).toFixed(2) + "M";
          } else if (n >= 1_000) {
            return (n / 1_000).toFixed(2) + "K";
          } else {
            return n.toString();
          }
        }

        async function loadData() {
          const res = await fetch("/api/data");
          const data = await res.json();

          function buildTable(coins, showChange = true) {
            let html = '<table><tr><th>Coin</th><th>Ticker</th><th>Fiyat ($)</th><th>MCap</th><th>Volume</th>';
            if (showChange) html += '<th>Hacim Değişim %</th>';
            html += '<th>Son Kayıt</th><th>Önceki Kayıt</th><th>Coingecko</th></tr>';

            for (const coin of coins) {
              const changeClass = coin.volume_change >= 0 ? "green" : "red";
              const coingeckoUrl = "https://www.coingecko.com/en/coins/" + coin.coin_id;
              html += \`<tr>
                <td>\${coin.coin_name}</td>
                <td>\${coin.ticker}</td>
                <td>\${coin.price.toFixed(2)}</td>
                <td>\${formatNumber(coin.market_cap)}</td>
                <td>\${formatNumber(coin.volume)}</td>\`;
              if (showChange) {
                html += \`<td class="\${changeClass}">\${coin.volume_change.toFixed(2)}%</td>\`;
              }
              html += \`<td>\${coin.created_at}</td>
                <td>\${coin.prev_time}</td>
                <td><a href="\${coingeckoUrl}" target="_blank">🔗</a></td>
              </tr>\`;
            }
            html += '</table>';
            return html;
          }

          document.getElementById("upTable").innerHTML = buildTable(data.sortedUp);
          document.getElementById("downTable").innerHTML = buildTable(data.sortedDown);
          document.getElementById("newComersTable").innerHTML = buildTable(data.newComers, false);
        }

        loadData();
      </script>
    </body>
    </html>
  `;
}
