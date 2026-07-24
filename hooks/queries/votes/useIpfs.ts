import { useQuery } from "@tanstack/react-query";

async function getIpfs<T>(hash?: string) {
  if (!hash) return undefined;
  // could also use ipfs.io/ipfs, but this may be more reliable
  const response = await fetch(`https://snapshot.4everland.link/ipfs/${hash}`);
  return (await response.json()) as T;
}

export function useIpfs<T>(ipfsHash?: string) {
  return useQuery({
    queryKey: [ipfsHash],
    queryFn: () => getIpfs<T>(ipfsHash),
    onError: (err) => console.error(err),
    enabled: !!ipfsHash,
  });
}
