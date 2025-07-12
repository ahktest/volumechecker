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

        <div id="warning" style="display:none; padding: 10px; margin-bottom: 20px; background-color: #ffdddd; color: #a10000; border: 1px solid #a10000; border-radius: 6px; font-weight: bold;">
          ⚠️ Henüz yeterince kayıt yok. Lütfen daha sonra tekrar deneyin.
        </div>

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

        function formatNumber(n) {
          if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
          if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
          if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
          return n.toString();
        }

        async function loadData() {
          const res = await fetch("/api/data");
          const data = await res.json();

          if (!data.sortedUp || data.sortedUp.length === 0) {
            document.getElementById("warning").style.display = "block";
            return;
          }

          function buildTable(coins, showChange = true) {
            let html = '<table><tr>' +
              '<th>Coin</th>' +
              '<th>Ticker</th>' +
              '<th>Fiyat ($)</th>' +
              '<th>MCap</th>' +
              '<th>Son Hacim</th>' +
              '<th>Son Tarih</th>' +
              '<th>Önceki Hacim</th>' +
              '<th>Önceki Tarih</th>' +
              '<th>Hacim Farkı (%)</th>' +
              '<th>Link</th>' +
              '</tr>';

            for (const coin of coins) {
              const changeClass = coin.volume_change >= 0 ? "green" : "red";
              const coingeckoUrl = "https://www.coingecko.com/en/coins/" + coin.coin_id;

              html += \`<tr>
                <td>\${coin.coin_name}</td>
                <td>\${coin.ticker}</td>
                <td>\${coin.price.toFixed(2)}</td>
                <td>\${formatNumber(coin.market_cap)}</td>
                <td>\${formatNumber(coin.volume)}</td>
                <td>\${coin.created_at}</td>
                <td>\${coin.prev_volume ? formatNumber(coin.prev_volume) : '-'}</td>
                <td>\${coin.prev_time ?? '-'}</td>
                <td class="\${coin.volume_change !== null ? changeClass : ''}">\${coin.volume_change !== null ? coin.volume_change.toFixed(2) + '%' : '-'}</td>
                <td><a href="\${coingeckoUrl}" target="_blank" style="color:#3399ff; text-decoration:none">➡️</a></td>
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