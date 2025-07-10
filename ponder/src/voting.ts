// @ts-nocheck
import { ponder } from "ponder:registry";
import schema from "ponder:schema";

// PriceRequested(address indexed requester, bytes32 identifier, uint256 time)
ponder.on("VotingV2:PriceRequested", async ({ event, context }) => {
  const { identifier, time } = event.params;
  await context.db.insert(schema.priceRequest).values({
    id: `${identifier}-${time}`,
    identifier,
    time: Number(time),
  });
});

// PriceSettled(bytes32 identifier, uint256 time, int256 price)
ponder.on("VotingV2:PriceSettled", async ({ event, context }) => {
  const { identifier, time, price } = event.params;
  const id = `${identifier}-${time}`;
  await context.db
    .update(schema.priceRequest)
    .whereEq({ id })
    .set({ isResolved: true, price: price.toString() });
});