import {getVertexClient, prettyPrintJson} from './common';
import { JsonRpcProvider, Wallet } from 'ethers';

async function main() {
  const vertexClient = await getVertexClient();

  // If you have access to `signer`, you can call `getAddress()` directly instead of reaching into `vertexClient.context`
  const address = await (
    vertexClient.context.signerOrProvider as Wallet
  ).getAddress();
  const subaccountName = 'default';
  // 1 USDC (6 decimals)
  const depositAmount = 10 ** 6;

  // TESTNET ONLY - Mint yourself some tokens
  const mintTx = await vertexClient.spot._mintMockERC20({
    amount: depositAmount,
    productId: 0,
  });
  // Mint goes on-chain, so wait for confirmation
  const mintTxReceipt = await mintTx.wait();
  if(mintTxReceipt==null) return
  prettyPrintJson('Mint Tx Hash', mintTxReceipt.hash);

  // Deposits move ERC20, so require approval, this is on-chain as well
  const approveTx = await vertexClient.spot.approveAllowance({
    amount: depositAmount,
    productId: 0,
  });
  const approveTxReceipt = await approveTx.wait();
  if(approveTxReceipt==null) return
  prettyPrintJson('Approve Tx Hash', approveTxReceipt.hash);

  // Now execute the deposit, which goes on-chain
  const depositTx = await vertexClient.spot.deposit({
    // Your choice of name for the subaccount, this subaccount will be credited
    subaccountName,
    amount: depositAmount,
    productId: 0,
  });
  const depositTxReceipt = await depositTx.wait();
    if(depositTxReceipt==null) return
  prettyPrintJson('Deposit Tx Hash', depositTxReceipt.hash);

  // Inject a delay for our offchain engine to pick up the transaction and credit your account
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // For on-chain state, you can use `getSubaccountSummary` - these should match up
  const subaccountData =
    await vertexClient.subaccount.getEngineSubaccountSummary({
      subaccountOwner: address,
      subaccountName,
    });
  prettyPrintJson('Subaccount Data After Deposit', subaccountData);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Now withdraw your funds, this goes to the off-chain engine
  // We're withdrawing less than 10 as there are withdrawal fees of 0.1 USDC
  
  const withdrawTx = await vertexClient.spot.withdraw({
    amount: depositAmount - 10 ** 5,
    productId: 0,
    subaccountName,
  });
  
  if(withdrawTx==null) return
  console.log('Withdraw Tx Hash', withdrawTx.status);
  // prettyPrintJson('Withdraw Tx', withdrawTx);

  // Your new subaccount summary should have zero balances
  const subaccountDataAfterWithdraw =
    await vertexClient.subaccount.getEngineSubaccountSummary({
      subaccountOwner: address,
      subaccountName,
    });
  prettyPrintJson(
    'Subaccount Data After Withdrawal',
    subaccountDataAfterWithdraw,
  );
}

main();