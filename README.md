# @u17g/idgen

```sh
npm i -S @u17g/idgen
pnpm add @u17g/idgen
bun add @u17g/idgen
```

## Prefixed ID

ID format:

```txt
ID = {prefix}{delimiter}{timestamp}{random}

- delimiter: '_' by default
- timestamp: 6 length base64 ascii lexicographic order part
- random: {length - 6} length cryptographic random base64 part
```

Example:

```ts
import { createGenerator, generate } from "@u17g/idgen/prefixed";

const genUserId = createGenerator("user");
const userId = genUserId(); // user_xxxxxxx
// or
const userId = generate("user"); // user_xxxxxx
```

## Prefixed ID with self-verifying token.

Enable a self-verifying token suffix. The token is derived from the
ID body and a secret key, so you can later verify the token integrity.

```ts
import { generate, verify } from "@u17g/idgen/prefixed";

const params = { length: 12, key: process.env.IDGEN_KEY! };
const id = generate("user", { includeVerifyToken: params });

verify(id, params); // true
```

Notes:

- Keep the key secret; rotate if exposed.
- Prefer `length` >= 12 for tamper detection; 16 is stronger.

## Publish (for maintainers)

```sh
# 1) login (one-time)
bunx npm whoami || bunx npm login

# 2) test & build
bun test
bun run build

# 3) publish to npm (scoped packages need access=public)
bun publish --access public
```