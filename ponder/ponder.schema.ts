// @ts-nocheck
import { onchainTable } from "ponder";

export const priceRequest = onchainTable("price_request", (t) => ({
  id: t.text().primaryKey(),
  identifier: t.text(),
  time: t.integer(),
  isResolved: t.boolean().notNull().default(false),
  price: t.text().nullable(),
  totalVotesRevealed: t.integer().nullable(),
}));

export default { priceRequest };