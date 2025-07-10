export async function fetchAndStoreCoins(env) {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=500&page=1");
  const data = await res.json();

  let count = 0;
  for (const coin of data) {
    await env.DB.prepare(
      `INSERT INTO coins (coin_id, coin_name, ticker, price, market_cap, volume, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      coin.id,
      coin.name,
      coin.symbol.toUpperCase(),
      coin.current_price,
      coin.market_cap,
      coin.total_volume
    )
    .run();

    count++;
  }
  return count;
}
