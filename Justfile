dev:
  pnpm dev

test:
  pnpm test

e2e:
  pnpm e2e

typecheck:
  pnpm typecheck

lint:
  pnpm lint

build:
  pnpm build

check: typecheck lint test
