import {getVertexClient, prettyPrintJson} from './common';
import fs from 'fs';
import { BigDecimal, toPrintableObject } from '@vertex-protocol/utils';

async function main() {
  const vertexClient = await getVertexClient();

  const allMarkets = await vertexClient.market.getAllEngineMarkets();
  prettyPrintJson('All Markets', allMarkets);
  // write to json file complete data
  fs.writeFile(`${"allmarkets" + ".json"}`, JSON.stringify(toPrintableObject(allMarkets), null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  })

  const latestMarketPrice = await vertexClient.market.getLatestMarketPrice({
    productId: 1,
  });
  prettyPrintJson('Latest Market Price (Product ID 1)', latestMarketPrice);
  fs.writeFile(`${"latestMarketPrice" + ".json"}`, JSON.stringify(toPrintableObject(latestMarketPrice), null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  })

  const marketLiquidity = await vertexClient.market.getMarketLiquidity({
    productId: 1,
    // Per side of the book
    depth: 2,
  });
  prettyPrintJson('Market Liquidity (Product ID 1)', marketLiquidity);
  fs.writeFile(`${"marketLiquidity" + ".json"}`, JSON.stringify(toPrintableObject(marketLiquidity), null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  })
}

main();