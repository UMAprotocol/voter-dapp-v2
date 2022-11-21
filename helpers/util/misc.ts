export const isExternalLink = (href: string) => !href.startsWith("/");

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
