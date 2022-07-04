export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function chunk<T>(array: T[], size: number) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
}
