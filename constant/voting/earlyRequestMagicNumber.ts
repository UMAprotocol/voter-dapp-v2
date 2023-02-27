export const earlyRequestMagicNumber =
  "-57896044618658097711785492504343953926634992332820282019728.792003956564819968";
export const earlyRequestMagicNumberWei =
  "-57896044618658097711785492504343953926634992332820282019728792003956564819968";

export function isEarlyVote(value: string | undefined):boolean{
  if(value === undefined) return false
  return [earlyRequestMagicNumber, earlyRequestMagicNumberWei].includes(value)
}

