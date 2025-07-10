// @ts-nocheck
import { onchainTable } from "ponder";

export const priceRequest = onchainTable("price_request", (t) => ({
  id: t.text().primaryKey(),
  identifier: t.text(),
  time: t.integer(),
  isResolved: t.boolean().notNull().default(false),
  price: t.text().nullable(),
  totalVotesRevealed: t.integer().nullable(),
  commitCount: t.integer().notNull().default(0),
  revealCount: t.integer().notNull().default(0),
}));

export const voteCommit = onchainTable("vote_commit", (t) => ({
  id: t.text().primaryKey(), // voter + priceRequest id
  priceRequestId: t.text().notNull().references(() => priceRequest.id),
  voter: t.text().notNull(),
  commitHash: t.text(),
  roundId: t.integer(),
}));

export const voteReveal = onchainTable("vote_reveal", (t) => ({
  id: t.text().primaryKey(),
  priceRequestId: t.text().notNull().references(() => priceRequest.id),
  voter: t.text().notNull(),
  price: t.text().nullable(),
  roundId: t.integer(),
}));

export default { priceRequest, voteCommit, voteReveal };