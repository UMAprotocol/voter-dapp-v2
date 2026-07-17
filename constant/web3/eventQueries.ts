// QuickNode rejects eth_getLogs calls spanning more than 10_000 blocks, so
// wider ranges must be queried in chunks of at most this size.
export const EVENT_QUERY_CHUNK_SIZE_BLOCKS = 10_000;
