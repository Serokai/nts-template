# nts-template

Roblox game, roblox-ts (Daimywil fork) + NevermoreEngine + ServiceBag DI, Rojo sync, pnpm with `node-linker=hoisted` (**required**: Nevermore loader breaks otherwise).

## Commands

```bash
pnpm run build           # TS → Luau
pnpm run watch
rojo serve
pnpm run overlay-types   # Overlay types/nevermore + patches/ into node_modules/@quenty
pnpm run generate-barrel # Regen src/shared/nevermore.d.ts
```

`postinstall` runs `overlay-types` + `generate-barrel` automatically.

## ServiceBag pattern

The only DI pattern here. `GameService` / `GameServiceClient` registers sub-services, then `Init()` then `Start()` run across all of them.

```typescript
export class MyService {
  private _serviceBag!: ServiceBag;
  public Init(serviceBag: ServiceBag) {
    assert(!this._serviceBag, "Already initialized");
    this._serviceBag = serviceBag;
  }
  public Start() {}
}
```

Add new services by calling `serviceBag.GetService(MyService)` inside `GameService.Init()`.

## IMPORTANT: extending Lua classes

roblox-ts `extends` doesn't work on raw `@quenty/*` Lua classes (no `super.constructor`). **YOU MUST** use the wrapper:

```typescript
import BaseObject from "lua/shared/Shared/BaseObjectWrapper";
class MyClass extends BaseObject<Part> {
  /* super(instance) works */
}
```

Never `import { BaseObject } from "@quenty/baseobject"` with `extends`.

## @quenty types

Types live in `types/nevermore/`, committed to the repo. On `pnpm install`, `overlay-types` copies them into `node_modules/@quenty/*` so roblox-ts's string-require transform picks them up.

Edit the `.d.ts` files under `types/nevermore/` directly. No augmentation layer, no upstream sync.

## Patching @quenty Lua modules

Put your patched version under `patches/@quenty/<pkg>/<same path as in node_modules>/`. The overlay step copies every file there (`.lua` and `.d.ts`) into `node_modules/@quenty/*` at each `pnpm install`.

```
patches/@quenty/maid/src/Shared/
├── Maid.lua       # patched version
└── Maid.d.ts      # matching types
```

On `pnpm up @quenty/<pkg>`, diff the upstream file against your patched version and reconcile manually.

## Template updates

This repo is meant to be consumed via GitHub. A game repo created from it can pull template updates:

```bash
git remote add template https://github.com/Serokai/nts-template.git
git fetch template
git merge template/main --allow-unrelated-histories
```

Resolve merge conflicts, commit.

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

## DO NOT

- Edit `src/shared/nevermore.d.ts` — auto-generated. Run `pnpm run generate-barrel`.
- Import from `src/shared/nevermore` at runtime — `.d.ts` barrel, zero runtime. Import `@quenty/*` directly.
- Use `npx rbxtsc` — use `pnpm run build` to avoid npm hoist warnings.
- Use `pnpm patch` — use `patches/@quenty/` overlay instead.
