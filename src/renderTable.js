export function calculateChange(oldPrice, newPrice) {
  if (!oldPrice || oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export function renderTable(coins) {
  let rows = `
    <table>
      <tr>
        <th>Coin</th>
        <th>Ticker</th>
        <th>Fiyat ($)</th>
        <th>Market Cap</th>
        <th>Volume</th>
        <th>Değişim %</th>
        <th>Tarih</th>
        <th>Coingecko</th>
      </tr>
  `;
  for (const coin of coins) {
    const changeClass = coin.change >= 0 ? "green" : "red";
    const coingeckoUrl = `https://www.coingecko.com/en/coins/${coin.coin_id}`;
    rows += `
      <tr>
        <td>${coin.coin_name}</td>
        <td>${coin.ticker}</td>
        <td>${coin.price.toFixed(2)}</td>
        <td>${formatNumber(coin.market_cap)}</td>
        <td>${formatNumber(coin.volume)}</td>
        <td class="${changeClass}">${coin.change.toFixed(2)}%</td>
        <td>${coin.created_at}</td>
        <td><a href="${coingeckoUrl}" target="_blank" rel="noopener noreferrer">🔗</a></td>
      </tr>
    `;
  }
  rows += `</table>`;
  return rows;
}

export function formatNumber(num) {
  if (!num) return "-";
  return num.toLocaleString("en-US");
}
