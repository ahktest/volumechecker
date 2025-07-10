export function renderTable(title, coins) {
  // Yardımcı sayı format fonksiyonu
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

  let html = `
    <h2>${title}</h2>
    <div style="overflow-x:auto;">
      <table style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        color: #ddd;
        background-color: #222;
      ">
        <thead>
          <tr style="background-color: #333;">
            <th>#</th>
            <th>Name</th>
            <th>Ticker</th>
            <th>Price ($)</th>
            <th>Market Cap</th>
            <th>Volume</th>
            <th>Change (%)</th>
            <th>Last</th>
            <th>Prev</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
  `;

  coins.forEach((coin, i) => {
    const changeColor = coin.volume_change > 0 ? "green" : coin.volume_change < 0 ? "red" : "gray";
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${coin.coin_name}</td>
        <td>${coin.ticker}</td>
        <td>$${coin.price.toFixed(4)}</td>
        <td>${formatNumber(coin.market_cap)}</td>
        <td>${formatNumber(coin.volume)}</td>
        <td style="color: ${changeColor};">${coin.volume_change.toFixed(2)}%</td>
        <td>${coin.created_at}</td>
        <td>${coin.prev_time}</td>
        <td>
          <a href="https://www.coingecko.com/en/coins/${coin.coin_id}" target="_blank" style="color: #4da6ff;">🔗</a>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}
