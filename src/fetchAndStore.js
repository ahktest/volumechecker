export async function fetchAndStoreCoins(env) {
  try {
    let count = 0;

    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&start=${(page - 1) * 100 + 1}`, {
        headers: {
          "Accept": "application/json",
          "X-CMC_PRO_API_KEY": "497ae0af-457f-4fa0-9151-ca876db2cf8f",
        }
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API response error (page", page, "):", res.status, text);
        throw new Error(`API hatası (sayfa ${page}): ${res.status}`);
      }

      const json = await res.json();
      const data = json.data;

      for (const coin of data) {
        console.log("CMC Coin:", {
          coin_id: coin.id.toString(),
          coin_name: coin.name,
          ticker: coin.symbol.toUpperCase(),
          price: coin.quote.USD.price,
          market_cap: coin.quote.USD.market_cap,
          volume: coin.quote.USD.volume_24h,
        });

        /* await env.DB.prepare(
          `INSERT INTO coins (coin_id, coin_name, ticker, price, market_cap, volume, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(
          coin.id.toString(),
          coin.name,
          coin.symbol.toUpperCase(),
          coin.quote.USD.price,
          coin.quote.USD.market_cap,
          coin.quote.USD.volume_24h
        )
        .run(); 

        count++;
      }
    }

    return count;

  } catch (err) {
    console.error("fetchAndStoreCoins error:", err);
    throw err;
  }
}