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