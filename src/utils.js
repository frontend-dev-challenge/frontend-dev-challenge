/** Shorten a Stellar public key for display, e.g. GABC...WXYZ. */
export function truncateAddress(address, start = 4, end = 4) {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
