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

## Common tasks

### Add a missing member to an existing @quenty type
1. Find the declaration: `types/nevermore/<pkg>/src/<Server|Client|Shared>/<Module>.d.ts`.
2. Add the missing property / method signature. Match the style of neighbouring declarations.
3. `pnpm run overlay-types` — copies the updated `.d.ts` into `node_modules/@quenty/<pkg>/`.
4. Verify in VS Code: the new member appears in autocomplete.

### Add types for a whole @quenty module that has none
1. Look at `node_modules/@quenty/<pkg>/` to understand the Lua surface (exported functions, classes).
2. Create `types/nevermore/<pkg>/index.d.ts` and mirror the Lua structure: re-export each submodule.
3. For each Lua module under `src/Shared/<Module>.lua`, create `types/nevermore/<pkg>/src/Shared/<Module>.d.ts` with the matching signatures.
4. `pnpm run overlay-types && pnpm run generate-barrel`.
5. Run `pnpm run build` to make sure nothing else broke.

### Patch a @quenty Lua module (behaviour change)
1. Copy the file you want to patch from `node_modules/@quenty/<pkg>/<path>/<File>.lua` to `patches/@quenty/<pkg>/<path>/<File>.lua`.
2. Edit the copy under `patches/`. Leave `node_modules/` untouched (it gets overlayed).
3. If you added new exports, edit the matching `.d.ts` under `types/nevermore/<pkg>/<path>/<File>.d.ts`.
4. `pnpm run overlay-types`.
5. Test in Studio. The overlay is re-applied on every `pnpm install`, so the patch survives reinstalls.
6. On `pnpm up @quenty/<pkg>`: diff the new upstream file against `patches/@quenty/<pkg>/<path>/<File>.lua` and reconcile.

### Add a new ServiceBag service
1. Create `src/modules/<area>/<Server|Client|Shared>/<Name>Service.ts` following the `ExampleService` pattern.
2. Register it inside `GameService.Init()` (server) or `GameServiceClient.Init()` (client) with `serviceBag.GetService(<Name>Service)`.
3. Implement `Init(serviceBag)` (capture dependencies) and `Start()` (run side effects). Never do work in the constructor.

### Install a new @quenty package
1. `pnpm add @quenty/<pkg>`.
2. If `types/nevermore/<pkg>/` does not exist yet, follow "Add types for a whole @quenty module that has none".
3. Otherwise `pnpm run overlay-types` is enough — postinstall already ran it.

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
