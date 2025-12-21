# AGENTS.md

## Build & Development Commands
- `bun dev` - Start development server
- `bun run build` - TypeScript check and Vite build
- `bun run lint` - Run ESLint
- No test framework configured

## Tech Stack
React 19 + TypeScript + Vite + TanStack Router + TanStack Query + Zustand + Zod + React Hook Form + Tailwind CSS 4 + shadcn/ui

## Code Style Guidelines
- **Imports**: Use `@/*` path alias for `src/*`. Group: external libs, then `@/` imports
- **Types**: Use `interface` for API types. Use `type` for inferred types (e.g., `z.infer<typeof schema>`)
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Components**: Functional components only. Place in `src/components/ui/` for UI primitives
- **Hooks**: Custom hooks in `src/hooks/` with `use-*.ts` naming. Export via barrel `index.ts`
- **Services**: API calls in `src/services/*.ts` as object with async methods
- **State**: Use Zustand for global state (`src/stores/`), TanStack Query for server state
- **Forms**: Use react-hook-form with zodResolver. Define schemas with `z.object({...})`
- **Error handling**: Catch errors in mutations, use `toast.error()` for user feedback
- **Routes**: Use TanStack Router file-based routing in `src/routes/`
