import { randomBytes as randomBytesCrypto } from "crypto";

// ASCII lexicographic order: 0-9 < A-Z < a-z
const ALPHA_NUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ALPHA_NUM_LENGTH = ALPHA_NUM.length;
const TIMESTAMP_LENGTH = 6;

function toBase62(num: number): string {
  let res = "";
  let n = num;
  do {
    res = ALPHA_NUM[n % ALPHA_NUM_LENGTH] + res;
    n = Math.floor(n / ALPHA_NUM_LENGTH);
  } while (n > 0);
  return res;
}

export type Options = {
  /**
   * @default 16
   */
  length?: number;
  /**
   * @default "_"
   */
  delimiter?: string;
  /**
   * @default crypto.randomBytes
   */
  randomBytes?: (length: number) => Buffer<ArrayBufferLike>;

  /**
   * @default true
   */
  includeTimestamp?: boolean;
  /**
   * @default Date.now
   */
  now?: () => number;
}

export function generate(prefix: string, { length = 16, delimiter = "_", randomBytes = randomBytesCrypto, now = Date.now, includeTimestamp = true }: Options = {}): string {
  // Compose timestamp as base62 string, padded to 6 chars
  let timestampPart = "";
  if (includeTimestamp) {
    const timestampNum = now();
    timestampPart = toBase62(timestampNum).padStart(TIMESTAMP_LENGTH, "0");
  }

  const randomLength = Math.max(length - (includeTimestamp ? TIMESTAMP_LENGTH : 0), 1);
  let randomPart = "";
  const bytes = randomBytes(randomLength);
  for (let i = 0; i < randomLength; i++) {
    randomPart += ALPHA_NUM[bytes[i]! % ALPHA_NUM_LENGTH];
  }
  return `${prefix}${delimiter}${timestampPart}${randomPart}`;
}

export function createGenerator(prefix: string, options?: Options): (options?: Options) => string {
  return (_opt) => generate(prefix, { ...options, ..._opt });
}
