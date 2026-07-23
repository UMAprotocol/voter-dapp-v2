import {
  TypedEvent,
  TypedEventFilter,
} from "@uma/contracts-frontend/dist/typechain/core/ethers/common";
import { EVENT_QUERY_CHUNK_SIZE_BLOCKS } from "constant";
import { promiseAllWithConcurrency } from "helpers/util/promiseConcurrency";

// mirrors the typechain queryFilter signature so typed events flow through unchanged
export interface ChunkableEventQuery {
  queryFilter<EventArgsArray extends Array<unknown>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number,
    toBlock?: string | number
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;
}

function makeChunkRanges(
  fromBlock: number,
  toBlock: number,
  chunkSize: number
): [number, number][] {
  const ranges: [number, number][] = [];
  for (let start = Math.max(fromBlock, 0); start <= toBlock; start += chunkSize)
    ranges.push([start, Math.min(start + chunkSize - 1, toBlock)]);
  return ranges;
}

export async function queryFilterInChunks<
  EventArgsArray extends Array<unknown>,
  EventArgsObject
>(
  contract: ChunkableEventQuery,
  filter: TypedEventFilter<EventArgsArray, EventArgsObject>,
  fromBlock: number,
  toBlock: number,
  chunkSize = EVENT_QUERY_CHUNK_SIZE_BLOCKS
): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>> {
  const ranges = makeChunkRanges(fromBlock, toBlock, chunkSize);
  const results = await promiseAllWithConcurrency(
    ranges.map(
      ([from, to]) =>
        () =>
          contract.queryFilter(filter, from, to)
    )
  );
  return results.flat();
}
