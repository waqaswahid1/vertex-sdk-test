import { JsonRpcProvider, Wallet } from 'ethers';
import {createVertexClient} from '@vertex-protocol/client';
import 'dotenv/config';
require('dotenv').config()

// import pk from env

/**
 * Create a VertexClient object
 */
async function main() {

  // Create a signer connected to Goerli testnet
  const signer = new Wallet(
    process.env.PK as string, // add private key, or import, or use .env
    new JsonRpcProvider(
      'https://goerli-rollup.arbitrum.io/rpc',
      {
        name: 'arbitrum-goerli',
        chainId: 421613,
      },
    ),
  );

  // Instantiate the main Vertex client
  const vertexClient = await createVertexClient('testnet', {
    signerOrProvider: signer,
  });

  console.log("vertexClient", vertexClient);
  
}

main();