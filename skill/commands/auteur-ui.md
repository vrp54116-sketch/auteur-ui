---
description: Run auteur-ui to build distinctive, non-generic UI designs
---

Execute the auteur-ui skill workflow:
1. Inspect `.auteur-ui/contract.json` or run `npx auteur-ui brief` to initialize task context.
2. Emit `.auteur-ui/directions.json` and preview directions with `npx auteur-ui preview --open`.
3. Await human selection, then run `npx auteur-ui lock <id>` to freeze contract.
4. Build using contract specifications and run `npx auteur-ui lint --json`.

