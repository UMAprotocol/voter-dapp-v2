import { useQuery } from "@tanstack/react-query";
import { warnOnce } from "helpers/util/log";

async function getIpfs<T>(hash?: string) {
  if (!hash) return undefined;
  // could also use ipfs.io/ipfs, but this may be more reliable
  const response = await fetch(`https://snapshot.4everland.link/ipfs/${hash}`);
  return (await response.json()) as T;
}

export function useIpfs<T>(ipfsHash?: string) {
  return useQuery({
    queryKey: ["ipfs", ipfsHash],
    queryFn: () => getIpfs<T>(ipfsHash),
    onError: (err) =>
      warnOnce(`ipfs:${ipfsHash ?? ""}`, "Failed to fetch from IPFS", err),
    enabled: !!ipfsHash,
    // content is addressed by hash, so it can never change
    staleTime: Infinity,
  });
}
