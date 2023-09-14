import { Wallet } from 'ethers';
import { getVertexClient, getWallet, prettyPrintJson } from "./common";
import { PlaceOrderParams } from "@vertex-protocol/client";
import { nowInSeconds } from "@vertex-protocol/utils";
import { getChainIdFromSigner, getExpirationTimestamp, OrderExpirationConfig} from "@vertex-protocol/contracts";

async function main() {

  const signer = getWallet();
  const vertexClient = await getVertexClient();

  const chainId = await getChainIdFromSigner(signer);

  const address = await (
    vertexClient.context.signerOrProvider as Wallet
  ).getAddress();
  const subaccountName = "default";
  const depositAmount = 10 ** 6;

  // SETUP - skipping logging here as it's in depositWithdraw
  let tx = await vertexClient.spot._mintMockERC20({
    productId: 0,
    amount: depositAmount,
  });
  await tx.wait();
  tx = await vertexClient.spot.approveAllowance({
    productId: 0,
    amount: depositAmount,
  });
  await tx.wait();
  tx = await vertexClient.spot.deposit({
    productId: 0,
    amount: depositAmount,
    subaccountName,
  });
  await tx.wait();
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const timeConfig : OrderExpirationConfig = {
    type: "default",
    expirationTime: nowInSeconds() + 60
  }

  // Create the order
  const orderParams: PlaceOrderParams["order"] = {
    subaccountName,
    // `nowInSeconds` is exposed by the `@vertex-protocol/utils` package
    // This gives 60s before the order expires
    // Currently, IOC is also supported as an expiration type
    expiration: getExpirationTimestamp(timeConfig).toString(),
    // Limit price
    // Set this to a low amount so that the order does not fill immediately, this might need adjustment based on the product & current price
    price: 20000,
    // Positive amount for buys, negative for sells
    amount: 1,
  };

  // Place the order
  const placeOrderResult = await vertexClient.market.placeOrder({
    order: orderParams,
    productId: 1,
  });
  prettyPrintJson("Place Order Result", placeOrderResult);

  // Now query orders for this subaccount
  const openOrders = await vertexClient.market.getOpenSubaccountOrders({
    subaccountOwner: address,
    subaccountName,
    productId: 1,
  });
  prettyPrintJson("Subaccount Open Orders", openOrders);

  const verifyingAddr =
    await vertexClient.context.engineClient.getOrderbookAddress(3);

  const digest = vertexClient.context.engineClient.getOrderDigest(
    placeOrderResult.orderParams,
    verifyingAddr,
    chainId,
  );
  await new Promise((resolve) => setTimeout(resolve, 10000));


  // Now cancel the order by its digest, you can cancel multiple at once
  const cancelOrderResult = await vertexClient.market.cancelOrders({
    digests: [digest],
    productIds: [1],
    subaccountName,
  });
  prettyPrintJson("Cancel Order Result", cancelOrderResult);

  // Now query orders after cancellation
  const openOrdersAfterCancel =
    await vertexClient.market.getOpenSubaccountOrders({
      subaccountOwner: address,
      subaccountName,
      productId: 1,
    });
  prettyPrintJson("Subaccount Open Orders After Cancel", openOrdersAfterCancel);

  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Cleanup by withdrawing
  await vertexClient.spot.withdraw({
    productId: 0,
    amount: depositAmount - 10 ** 5,
    subaccountName,
  });
}

main();