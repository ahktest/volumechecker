import { baseCSS } from "./cssTemplate.js";
import { renderTable } from "../renderTable.js";

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

        <div id="tablesContainer">
          <div id="upTable">Yükleniyor...</div>
          <div id="downTable">Yükleniyor...</div>
          <div id="newComersTable">Yükleniyor...</div>
        </div>
      </div>

      <script type="module">
        import { renderTable } from '../renderTable.js';

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

          document.getElementById("upTable").innerHTML = renderTable("🚀 Top 20 Artış", data.sortedUp);
          document.getElementById("downTable").innerHTML = renderTable("🔻 Top 20 Düşüş", data.sortedDown);
          document.getElementById("newComersTable").innerHTML = renderTable("✨ Son 6 saatte ilk 500'e girenler", data.newComers);
        }

        loadData();
      </script>
    </body>
    </html>
  `;
}
