# Repository Guidelines

## Project Structure & Module Organization
- `client/`: React 19 frontend (pages, reusable UI, hooks, and contexts under `client/src/`).
- `server/`: Express + tRPC backend (`routers.ts`, integrations, proposal/PDF generation). Core runtime internals are in `server/_core/`.
- `shared/`: Cross-layer TypeScript types, constants, and pricing logic used by both client and server.
- `drizzle/`: Database schema, relations, and SQL migrations.
- `docs/` and `research/`: Product documentation and market/pricing research.
- `patches/`: `pnpm` patched dependency files.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm dev`: run local development server (`tsx watch server/_core/index.ts`).
- `pnpm build`: build client via Vite and bundle server via esbuild into `dist/`.
- `pnpm start`: run production build from `dist/index.js`.
- `pnpm test`: run Vitest test suite once.
- `pnpm check`: run TypeScript type-checking without emit.
- `pnpm format`: format the codebase with Prettier.
- `pnpm db:push`: generate and apply Drizzle migrations.

## Coding Style & Naming Conventions
- Language: TypeScript (ESM).
- Formatting: Prettier (`.prettierrc`) with 2-space indentation, semicolons, double quotes, trailing commas (`es5`), max line width 80.
- Naming: React components and pages in `PascalCase` (for example, `Results.tsx`); utilities/modules in `camelCase` where appropriate.
- Keep shared contracts in `shared/` to avoid client/server type drift.

## Testing Guidelines
- Framework: Vitest (`vitest.config.ts`), Node test environment.
- Test locations: `server/**/*.test.ts`, `server/**/*.spec.ts`, `shared/**/*.test.ts`, `shared/**/*.spec.ts`.
- Prefer focused unit tests around routing, pricing, and proposal generation logic.
- Run `pnpm test` before opening a PR; run `pnpm check` for type safety.

## Commit & Pull Request Guidelines
- Existing history uses `Checkpoint:`-prefixed commit messages. Keep that style or use concise imperative summaries consistently.
- Commit messages should describe what changed and why, not only file-level actions.
- PRs should include: short scope summary, linked issue/task, test evidence (`pnpm test`, `pnpm check`), and screenshots for UI changes.
- Keep PRs small and scoped; call out any schema or environment variable changes explicitly.
