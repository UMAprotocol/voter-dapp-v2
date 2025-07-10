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

// VoteCommitted(address indexed voter, bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 commitHash, uint256 roundId, uint256 newTotalCommits)
ponder.on("VotingV2:VoteCommitted", async ({ event, context }) => {
  const { voter, identifier, time, ancillaryData, commitHash, roundId } =
    event.params;
  const priceRequestId = `${identifier}-${time}`;
  // Ensure priceRequest exists
  await context.db
    .upsert(schema.priceRequest)
    .values({ id: priceRequestId, identifier, time: Number(time) })
    .onConflictDoNothing();

  await context.db.insert(schema.voteCommit).values({
    id: `${priceRequestId}-${voter.toLowerCase()}`,
    priceRequestId,
    voter: voter.toLowerCase(),
    commitHash,
    roundId: Number(roundId),
  });

  // Increment commit count
  const current = await context.db
    .select({ commitCount: schema.priceRequest.commitCount })
    .from(schema.priceRequest)
    .whereEq({ id: priceRequestId })
    .executeTakeFirst();
  const newCount = (current?.commitCount ?? 0) + 1;
  await context.db
    .update(schema.priceRequest)
    .whereEq({ id: priceRequestId })
    .set({ commitCount: newCount });
});

// VoteRevealed(address indexed voter, bytes32 identifier, uint256 time, bytes ancillaryData, int256 price, uint256 roundId, uint256 newTotalReveals)
ponder.on("VotingV2:VoteRevealed", async ({ event, context }) => {
  const { voter, identifier, time, ancillaryData, price, roundId } =
    event.params;
  const priceRequestId = `${identifier}-${time}`;

  await context.db
    .upsert(schema.priceRequest)
    .values({ id: priceRequestId, identifier, time: Number(time) })
    .onConflictDoNothing();

  await context.db.insert(schema.voteReveal).values({
    id: `${priceRequestId}-${voter.toLowerCase()}`,
    priceRequestId,
    voter: voter.toLowerCase(),
    price: price.toString(),
    roundId: Number(roundId),
  });

  // Increment reveal count
  const currentReveal = await context.db
    .select({ revealCount: schema.priceRequest.revealCount })
    .from(schema.priceRequest)
    .whereEq({ id: priceRequestId })
    .executeTakeFirst();
  const newReveal = (currentReveal?.revealCount ?? 0) + 1;
  await context.db
    .update(schema.priceRequest)
    .whereEq({ id: priceRequestId })
    .set({ revealCount: newReveal });
});