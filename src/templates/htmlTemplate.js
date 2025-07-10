import { baseCSS } from "./cssTemplate.js";
import { renderTable } from "../renderTable.js";

export function generateHTML(sortedUp, sortedDown) {
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
}
