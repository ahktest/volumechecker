export async function fetchAndStoreCoins(env) {
  const totalPages = 2; // 500 coin için
  const perPage = 250;
  let allCoins = [];

  for (let page = 1; page <= totalPages; page++) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=${perPage}&page=${page}&sparkline=false`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "volumechecker-bot/1.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status} ${response.statusText}`);
    }

    const coins = await response.json();
    allCoins = allCoins.concat(coins);
  }

  for (const coin of allCoins) {
    await env.DB.prepare(
      `INSERT INTO coins (coin_name, ticker, price, market_cap, volume, coin_id) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        coin.name,
        coin.symbol,
        coin.current_price,
        coin.market_cap,
        coin.total_volume,
        coin.id
      )
      .run();
  }

  return allCoins.length;
}
