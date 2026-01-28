import { createHmac, randomBytes as randomBytesCrypto, timingSafeEqual } from "crypto";

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

function bytesToBase62(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return "0";
  }

  let digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const value = digits[i]! * 256 + carry;
      digits[i] = value % ALPHA_NUM_LENGTH;
      carry = Math.floor(value / ALPHA_NUM_LENGTH);
    }
    while (carry > 0) {
      digits.push(carry % ALPHA_NUM_LENGTH);
      carry = Math.floor(carry / ALPHA_NUM_LENGTH);
    }
  }

  let res = "";
  for (let i = digits.length - 1; i >= 0; i--) {
    res += ALPHA_NUM[digits[i]!]!;
  }
  return res;
}

function generateVerifyToken(id: string, key: string, length: number): string {
  const hmac = createHmac("sha256", key);
  hmac.update(id);
  const token = bytesToBase62(hmac.digest());
  return token.padStart(length, "0").slice(0, length);
}

export type VerifyTokenParams = {
  /**
   * should be >= 12 for tamper detection.
   */
  length: number;
  /**
   * secret key to generate the token. keep it secret.
   */
  key: string;
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
  randomBytes?: (length: number) => Uint8Array;

  /**
   * @default true
   */
  includeTimestamp?: boolean;
  /**
   * @default false
   */
  includeVerifyToken?: VerifyTokenParams | false;
  /**
   * @default Date.now
   */
  now?: () => number;
}

export function generate(prefix: string, { length = 16, delimiter = "_", randomBytes = randomBytesCrypto, now = Date.now, includeTimestamp = true, includeVerifyToken = false }: Options = {}): string {
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

  const id = `${prefix}${delimiter}${timestampPart}${randomPart}`;

  if (includeVerifyToken) {
    const token = generateVerifyToken(id, includeVerifyToken.key, includeVerifyToken.length);
    return `${id}${token}`;
  } else {
    return id;
  }
}

export function createGenerator(prefix: string, options?: Options): (options?: Options) => string {
  return (_opt) => generate(prefix, { ...options, ..._opt });
}


export function verify(id: string, params: VerifyTokenParams): boolean {
  const tokenStart = id.length - params.length;
  if (tokenStart <= 0) {
    return false;
  }
  const idPart = id.slice(0, tokenStart);
  const validityPart = id.slice(tokenStart);
  const token = generateVerifyToken(idPart, params.key, params.length);

  if (token.length !== validityPart.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(token), Buffer.from(validityPart));
}

export function createVerifier(params: VerifyTokenParams): (id: string) => boolean {
  return (id) => verify(id, params);
}