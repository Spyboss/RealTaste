# Contributing

Thank you for your interest in improving RealTaste. This document describes how to propose changes safely and consistently.

## Branching model
- The `main` branch represents production-ready code.
- Create feature branches from `main` using the format `feature/<short-description>` or `fix/<issue-id>`.
- Rebase against `main` before opening a pull request to keep history clean.

## Commit messages
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add delivery fee calculator`, `docs: rewrite setup guide`).
- Keep commits scoped; avoid combining unrelated changes.

## Pull requests
1. Ensure all workspace lint/type-check scripts pass locally.
2. Provide context in the PR description, referencing related issues.
3. Include testing notes (commands run, screenshots if UI changes) in the PR body.
4. Request review from at least one maintainer. Do not merge your own PR without review.
5. Squash-merge if the commit history is noisy; otherwise merge fast-forward.

## Coding standards
- **TypeScript:** strict mode enabled across packages. Prefer explicit types where inference is unclear.
- **Formatting:** `eslint` + `prettier` configs are included. Run `npm run lint --workspaces` before pushing.
- **Testing:** Unit and integration tests live alongside packages. Use `npm run test --workspaces` (or package-level scripts) when modifying logic.
- **Security:** Never commit secrets. Validate Supabase RLS policies and PayHere keys when touching authentication or payments.

## Running checks
```bash
npm run type-check --workspaces
npm run lint --workspaces
npm run test --workspaces
```

## Documentation updates
- Place product and engineering docs under `docs/`.
- Update `CHANGELOG.md` with a new entry for any user-visible change.
- If adding new environment variables, update `production.env.example` and `docs/setup.md`.

By following these guidelines we preserve a maintainable codebase and a high-quality developer experience.
