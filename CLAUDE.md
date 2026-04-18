# nts-template

Nevermore is a collection of Lua modules that accelerate Roblox development so you can focus on gameplay. This template wires Nevermore into a TypeScript project (roblox-ts Daimywil fork) with type ownership and a patching workflow pre-configured.

Stack: roblox-ts (Daimywil fork) + NevermoreEngine + ServiceBag DI, Rojo sync, pnpm with `node-linker=hoisted` (**required** — Nevermore loader breaks otherwise).

## Commands

```bash
pnpm run build           # TS → Luau
pnpm run watch
rojo serve
pnpm run overlay-types   # Copy types/nevermore + patches/ into node_modules/@quenty
pnpm run generate-barrel # Regen src/shared/nevermore.d.ts
```

`postinstall` runs `overlay-types` + `generate-barrel` automatically.

## Architecture

- **DI**: ServiceBag. `GameService` / `GameServiceClient` register sub-services; `Init()` runs across all, then `Start()`. Never do work in constructors. See `ExampleService.ts` for the canonical shape.
- **Nevermore types**: owned in-repo under `types/nevermore/`, overlayed into `node_modules/@quenty/*` on install. Edit the `.d.ts` files directly.
- **Nevermore patches**: put patched files under `patches/@quenty/<pkg>/<same path as in node_modules>/`. Overlayed on install alongside types.

## YOU MUST: wrap any @quenty class before `extends`

roblox-ts `extends` doesn't work on raw `@quenty/*` Lua classes — they have no `super.constructor`. Every class you want to extend needs a wrapper. The template ships with `lua/shared/Shared/BaseObjectWrapper.lua` as the canonical pattern:

```typescript
import BaseObject from "lua/shared/Shared/BaseObjectWrapper";
class MyClass extends BaseObject<Part> { /* super(instance) works */ }
```

For any other @quenty class, create a matching `lua/shared/Shared/<Name>Wrapper.lua` following the same delegation pattern, then import from it. If you see code doing `import { X } from "@quenty/<pkg>"` followed by `extends X`, flag it — that will silently break at runtime.

## Common tasks

### Add a missing member to an existing @quenty type
1. Open `types/nevermore/<pkg>/src/<Server|Client|Shared>/<Module>.d.ts`.
2. Add the signature, matching neighbouring declarations.
3. `pnpm run overlay-types`.

### Add types for a whole @quenty package that has none
1. Inspect `node_modules/@quenty/<pkg>/` to read the Lua surface.
2. Create `types/nevermore/<pkg>/index.d.ts` re-exporting each submodule.
3. For each Lua module, write the matching `.d.ts` under the same relative path.
4. `pnpm run overlay-types && pnpm run generate-barrel && pnpm run build`.

### Patch a @quenty Lua module
1. Copy the target file from `node_modules/@quenty/<pkg>/...` to `patches/@quenty/<pkg>/...` (same relative path).
2. Edit the copy under `patches/`.
3. If new exports: update the matching `.d.ts` under `types/nevermore/`.
4. `pnpm run overlay-types`.
5. On `pnpm up @quenty/<pkg>`: diff the new upstream against your patched file and reconcile.

### Add a new ServiceBag service
1. Create `src/modules/<area>/<Server|Client|Shared>/<Name>Service.ts` like `ExampleService`.
2. Register via `serviceBag.GetService(<Name>Service)` inside `GameService.Init()` or `GameServiceClient.Init()`.
3. Capture dependencies in `Init(serviceBag)`, run side effects in `Start()`.

## Template updates

```bash
git remote add template https://github.com/Serokai/nts-template.git
git fetch template
git merge template/main --allow-unrelated-histories
```

Resolve conflicts, commit.

## Code style

- **Maid**: `maid.Add(task)`, never `GiveTask`.
- **Guards**: always block form with braces, never one-liners. Combine same-concept guards with `||`.
- **Warn**: `warn(string.format("[ClassName] - <msg>", ...))`. Module name only, `string.format` only, never `${}` templates.
- **Enum-like**: `export const X = { K: "V" } as const;` + `export type T = (typeof X)[keyof typeof X];`
- **Constants file**: only when ≥2 consumers. Single-use → module-local `const`.
- **Single-use helpers**: inline them. Only extract when called from loops or multiple sites.
- **No comments** unless asked; only non-obvious WHY at point of surprise.
- **Full variable names** (`humanoid`, `character` — never `hum`, `c`).
- **AdorneeData booleans**: `Is*` / `Has*` prefixes.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, ...).

## DO NOT

- Edit `src/shared/nevermore.d.ts` — auto-generated. Run `pnpm run generate-barrel`.
- Import from `src/shared/nevermore` at runtime — `.d.ts` barrel, zero runtime. Import `@quenty/*` directly.
- Use `npx rbxtsc` — use `pnpm run build` to avoid npm hoist warnings.
- Use `pnpm patch` — use the `patches/@quenty/` overlay instead.
