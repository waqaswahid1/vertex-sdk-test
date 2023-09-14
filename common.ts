import { JsonRpcProvider, Wallet } from 'ethers';
import { createVertexClient } from '@vertex-protocol/client';
import { BigDecimal, toPrintableObject } from '@vertex-protocol/utils';
import 'dotenv/config';
require('dotenv').config()
import fs from 'fs';
/**
 * Creates an Ethers wallet connected to Arbitrum Goerli testnet
 */
export function getWallet() {
  return new Wallet(
    process.env.PK as string, // input PK here 
    new JsonRpcProvider(
      'https://goerli-rollup.arbitrum.io/rpc',
      {
        name: 'arbitrum-goerli',
        chainId: 421613,
      },
    ),
  );
}

/**
 * Creates a Vertex client for example scripts
 */
export async function getVertexClient() {
  const signer = getWallet();
  return createVertexClient('testnet', {
    signerOrProvider: signer
  });
}

/**
 * Util for pretty printing JSON
 */
export function prettyPrintJson(label: string, json: any) {
  console.log(label);
  console.log(JSON.stringify(toPrintableObject(json), null, 2));
  
                          
}
