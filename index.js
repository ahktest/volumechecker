export default {
  async fetch(request, env, ctx) {
    const totalPages = 2;
    const perPage = 250;
    let allCoins = [];

    for (let page = 1; page <= totalPages; page++) {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=${perPage}&page=${page}&sparkline=false`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "volumechecker-bot/1.0 (https://github.com/ahktest/volumechecker)",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        return new Response(`API hatası: ${response.status} ${response.statusText}`, { status: 500 });
      }

      const coins = await response.json();
      allCoins = allCoins.concat(coins);
    }

    // Tüm coinleri DB'ye kaydet
    for (const coin of allCoins) {
      await env.DB.prepare(
        `INSERT INTO coins (coin_name, ticker, price, market_cap, volume) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          coin.name,
          coin.symbol,
          coin.current_price,
          coin.market_cap,
          coin.total_volume
        )
        .run();
    }

    return new Response(`Başarıyla ${allCoins.length} coin kayıt edildi.`, { status: 200 });
  },
};
