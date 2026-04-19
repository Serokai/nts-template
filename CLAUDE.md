# nts-template

Nevermore is a collection of Lua modules that accelerate Roblox development so you can focus on gameplay. This template exists to start a new TypeScript project on top of Nevermore quickly.

Made possible thanks to [Daimywil](https://github.com/Daimywil), whose roblox-ts fork bridges TypeScript and Nevermore's string-require pattern, and whose extensive TypeScript declarations for Nevermore modules served as the starting point for `types/nevermore/`.

## Commands

```bash
pnpm run build           # TS → Luau
pnpm run watch
rojo serve
pnpm run overlay-types   # Copy types/nevermore into node_modules/@quenty
pnpm run generate-barrel # Regen src/shared/nevermore.d.ts
```

`postinstall` runs `overlay-types` + `generate-barrel` automatically.

## YOU MUST: wrap any @quenty class before `extends`

roblox-ts `extends` doesn't work on raw `@quenty/*` Lua classes — they have no `super.constructor`. Every class you want to extend needs a wrapper. The template ships with `lua/shared/Shared/BaseObjectWrapper.lua` as the canonical pattern:

```typescript
import BaseObject from "lua/shared/Shared/BaseObjectWrapper";
class MyClass extends BaseObject<Part> {
  /* super(instance) works */
}
```

For any other @quenty class, create a matching `lua/shared/Shared/<Name>Wrapper.lua` following the same delegation pattern, then import from it. If you see code doing `import { X } from "@quenty/<pkg>"` followed by `extends X`, flag it — that will silently break at runtime.

## Common tasks

### Add a missing member to an existing @quenty type

1. Open `types/nevermore/<pkg>/src/<Server|Client|Shared>/<Module>.d.ts`.
2. Add the signature, matching neighbouring declarations.
3. `pnpm run overlay-types`.
4. In application code, import from `@quenty/<pkg>` (not `types/nevermore/<pkg>` — see DO NOT below).

### Add types for a whole @quenty package that has none

1. Inspect `node_modules/@quenty/<pkg>/` to read the Lua surface.
2. Create `types/nevermore/<pkg>/index.d.ts` re-exporting each submodule.
3. For each Lua module, write the matching `.d.ts` under the same relative path.
4. `pnpm run overlay-types && pnpm run build`.

### Patch a @quenty Lua module (behaviour change)

1. `pnpm patch @quenty/<pkg>` — pnpm prints a sandbox path.
2. Edit the relevant `.lua` files inside that sandbox.
3. `pnpm patch-commit "<printed sandbox path>"` — pnpm writes `patches/@quenty__<pkg>@<version>.patch`, adds it to `pnpm-lock.yaml` under `patchedDependencies`, and re-runs install (which re-overlays types via `postinstall`).
4. If new exports: update the matching `.d.ts` under `types/nevermore/<pkg>/...` and run `pnpm run overlay-types`.
5. On `pnpm up @quenty/<pkg>`: pnpm re-applies the patch; if a hunk fails, it errors loudly — edit the `.patch` (or redo steps 1–3 against the new version) to reconcile.

### Add a new ServiceBag service

1. Create `src/modules/<area>/<Server|Client|Shared>/<Name>Service.ts` like `ExampleService`.
2. Register via `serviceBag.GetService(<Name>Service)` inside `GameService.Init()` or `GameServiceClient.Init()`.
3. Capture dependencies in `Init(serviceBag)`, run side effects in `Start()`. Never do work in constructors — `Init` runs across all services before any `Start`.

## Upstream a change from a game repo back to the template

When you're working inside a game repo (not the template) and you edit a template-owned file — `types/nevermore/`, `scripts/`, `CLAUDE.md`, `lua/shared/Shared/` — you can push that change to the template with one command:

```bash
nts promote -m "feat(types): add missing Maid members" types/nevermore/maid/src/Shared/Maid.d.ts
```

This clones the template into a temp dir, copies the current state of the listed files from your game, commits with your message, pushes `main`, and cleans up. No manual cherry-picking. Requires the `template` remote to exist (the `nts` CLI sets it up when it creates the game repo).

## Template updates

To pull improvements from the template into an existing game repo:

```bash
git remote add template https://github.com/Serokai/nts-template.git  # first time only
git fetch template
git merge template/main --allow-unrelated-histories
```

If the merge reports conflicts, open each conflicted file, keep the right side (your game code wins on gameplay files; the template wins on tooling like `scripts/`, `types/nevermore/`, `CLAUDE.md`), then `git add <file>` and `git commit` to finalize the merge.

## Code style

- **Maid**: `maid.Add(task)`, never `GiveTask`.
  - **Connections** (`x.Connect(...)`, `x.Connect(handler)`): wrap inline is fine — `maid.Add(x.Connect(() => {...}))`. The connection value isn't reused.
  - **Stored objects** (classes, signals, observables kept on `this._x`): extract to a variable first, then add. Never use the return value of `Add`. Example: `this._playerSet = new ObservableSet(); this._maid.Add(this._playerSet);` — not `this._playerSet = this._maid.Add(new ObservableSet())`.
- **t.\* validators**: values returned by `t.literal(...)`, `t.interface(...)`, etc. are called _validators_ — suffix the binding `xValidator`, not `isX`. Example: `const shapeValidator = t.literal(...)`, not `isShape`.
- **Guards**: always block form with braces, never one-liners. Combine same-concept guards with `||`.
- **Warn**: `warn(string.format("[ClassName] - <msg>", ...))`. Module name only, `string.format` only, never `${}` templates. Message itself follows the same terse quenty style as asserts: `"bad <thing> %s"` or `"no <thing>"` — never "unknown X", "invalid X", full sentences.
- **Assert/error messages**: terse, quenty-style. `"Bad <thing>"` or `"No <thing>"` — never full sentences. Prefix with `[ClassName] - ` when the call site isn't obvious. Examples: `assert(isZoneShape(shape), "[Zone] - bad shape")`, `assert(typeIs(size, "Vector3"), "Bad size")`, `assert(player, "No player")`.
- **Enum-like**: `export const X = { K: "V" } as const;` + `export type T = (typeof X)[keyof typeof X];`
- **Constants file**: only when ≥2 consumers. Single-use → module-local `const`.
- **Utility file naming**: `*Utils.ts` / `*Data.ts` / `*Wrapper.ts` — name shared util files by domain + role suffix, not after their main exported function. Example: a wrapper around `CreateBlendStory` lives in `BlendStoryUtils.ts`, not `CreateBlendStory.ts`. Matches the Quenty `*Utils` pattern (`SoundUtils`, `RxPlayerUtils`). `*Service.ts` is reserved for ServiceBag services.
- **Single-use helpers**: inline them. Only extract when called from loops or multiple sites. Applies equally to private methods (`_tick`, `_handleX`, ...) — a method called from exactly one site is noise, inline it directly at the call. Example: don't extract a `_trackPart(part)` helper for a one-liner subscription — if the Heartbeat already runs, just do `this._cframe = part.CFrame` inside the existing Heartbeat closure instead of a separate `GetPropertyChangedSignal` subscription in its own method.
- **No comments** unless asked; only non-obvious WHY at point of surprise.
- **Full variable names** (`humanoid`, `character` — never `hum`, `c`).
- **AdorneeData booleans**: `Is*` / `Has*` prefixes.
- **AdorneeData access**: never `.Get(instance)` — always `.Create(instance)` once, store on `this._data`, then read via `this._data.<Key>.Value` (per-key `ValueObjectLike`) or observe via `this._data.<Key>.Observe()`. `.Get` returns a stale snapshot; `.Create` gives reactive per-key bindings suitable for signal wiring and Blend mounts.
- **Bound classes (Binder)**: do all setup in the constructor — no `Init` / `Start` methods on the bound class (that pattern is for ServiceBag services only). Bound instances get one ctor call per tagged Instance.
  - **Binder lifecycle**: register the `Binder` itself in the bag via `serviceBag.GetService(MyBinder)` — because `Binder` already has `ServiceName`, `Init(serviceBag)`, `Start()`, the bag stores the `serviceBag` as the Binder's args and auto-calls `Init`/`Start`. Don't call `MyBinder.Init(serviceBag)` / `MyBinder.Start()` manually.
  - **Bound class ctor signature**: `(instance: T, serviceBag: ServiceBag)`. The serviceBag is forwarded automatically to each ctor call because the bag passed it as the Binder's stored `args` during registration.
  - **Dependency resolution**: inside the ctor, use `serviceBag.GetService(...)` to retrieve services. Do **not** pass resolved service instances as extra Binder args — the bag is enough.
- **Register shared instances in the bag**: a module-level singleton (e.g. a pre-configured `GenericScreenGuiProvider`) can be registered with `serviceBag.GetService(mySingleton)` — the bag keys it by `ServiceName`, calls `Init(serviceBag)` + `Start()`, and subsequent lookups return the same instance. Use this to share configured providers across bound classes without manual lifecycle plumbing.
- **BaseObject instance**: subclasses must call `super(part)` and then read the instance via `this._obj` (typed by `BaseObject<T>`). Do not store `this._instance = part` in parallel — that's a second source of truth for the same reference.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, ...).

## DO NOT

- Edit `src/shared/nevermore.d.ts` — auto-generated. Run `pnpm run generate-barrel`.
- Import from `src/shared/nevermore` at runtime — `.d.ts` barrel, zero runtime. Import `@quenty/*` directly.
- Import from `types/nevermore/<pkg>` — that path is the overlay source, not a runtime module. Always import `@quenty/<pkg>`. If `@quenty/<pkg>` doesn't resolve, the fix is `pnpm add @quenty/<pkg>`, not rewriting the import to `types/...`. Importing from `types/nevermore/` compiles without error but silently degrades types to `any` whenever a transitive @quenty package isn't installed — losing all inference with no TS warning.
- Use `npx rbxtsc` — use `pnpm run build` to avoid npm hoist warnings.
- Remove `public-hoist-pattern[]=@quenty/*` or `@rbxts/*` from `.npmrc` — Rojo's `$path` glob and the roblox-ts string-require transform both expect these scopes directly under `node_modules/`.
- Run `pnpm install --ignore-scripts` — skips `postinstall`, so types never overlay into `node_modules/@quenty/*` and the compiler will see wrong types.
