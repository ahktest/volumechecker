export default {
  async fetch(request, env, ctx) {
    const totalPages = 4;
    const perPage = 250;
    let allCoins = [];

    try {
      for (let page = 1; page <= totalPages; page++) {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=${perPage}&page=${page}&sparkline=false`;
        
        const response = await fetch(url);
        if (!response.ok) {
          return new Response(`API hatası: ${response.statusText}`, { status: 500 });
        }

        const coins = await response.json();
        allCoins = allCoins.concat(coins);
      }

      // Sonuçları konsola bas
      console.log(`Toplam çekilen coin sayısı: ${allCoins.length}`);
      console.log("İlk 5 örnek:", JSON.stringify(allCoins.slice(0, 5), null, 2));

      return new Response(`Başarıyla ${allCoins.length} coin çekildi. Konsola bak!`, { status: 200 });
    } catch (error) {
      console.error("Hata:", error);
      return new Response(`Bir hata oluştu: ${error.message}`, { status: 500 });
    }
  },
};
