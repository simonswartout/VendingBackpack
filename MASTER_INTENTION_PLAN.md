# Master Intention Plan

## Objective
Stabilize operational data consistency and transport contracts before first large-scale production rollout.

## Target Outcome
- Rails owns live operational truth.
- SQL-backed models own live operational persistence.
- `Frontend-Next` is the production operational client.
- Operational API contracts use one external naming convention: `camelCase`.
- Manager and employee flows read the same route and inventory truth.
- Fixture-backed helpers are no longer live authority for operational data.

## Scope Implemented
- backend inventory, items, machines, employees, routes, shipments, transactions
- `Frontend-Next` dashboard, routes, warehouse, auth session handling
- local seeded Docker validation path
- local browser validation through the nginx `/api` proxy

## Explicit Production Decisions
- Ship: `Backend` + `Frontend-Next`
- Do not ship as operational production surfaces: `Frontend`, `Frontend-Admin-Center`
- Keep for seed, test, or internal-only support: fixture-era helpers and Admin Center mock repositories

## Major Changes Applied
- Added SQL-backed `VendingTransaction` persistence and migration.
- Moved transaction create and refund flows onto `InventoryAuthority`.
- Normalized operational backend DTOs to `camelCase`.
- Added explicit barcode lookup route at `/api/items/barcode/:barcode`.
- Aligned manager and employee route reads to the same route DTO shape.
- Replaced heuristic dashboard route assignment with route-backed assignment data.
- Added shared operational DTO definitions in `Frontend-Next`.
- Fixed seed-mode auth so the local seeded session also attaches bearer tokens to live API requests.
- Added seeded local auth support in Rails for local Docker verification.
- Added seeded operational records for items, machines, machine inventory, routes, shipments, and transactions.
- Removed the Flutter frontend image from the production publish workflow.

## Local Validation Completed
- Frontend typecheck: `npx tsc --noEmit`
- Frontend tests: `npm test`
- Backend integration suite inside Docker image:
  - `docker run --rm -e RAILS_ENV=test --entrypoint /bin/sh vendingbackpack/backend:local -lc "./bin/rails db:prepare && ./bin/rails test"`
- Local seeded stack:
  - `ALLOW_SEED_AUTH=true SEED_DEMO_DATA=true FRONTEND_AUTH_MODE=seed docker compose up -d --build backend frontend`
- Playwright validation against `http://localhost:9100`
  - manager dashboard
  - manager routes
  - manager warehouse
  - employee dashboard
  - employee routes
  - transaction create and refund consistency

## Contract Validation Highlights
- Route DTO keys:
  - `id`, `employeeId`, `employeeName`, `distanceMeters`, `durationSeconds`, `stops`, `createdAt`, `updatedAt`
- Route stop DTO keys:
  - `machineId`, `name`, `lat`, `lng`, `location`, `position`
- Warehouse DTO keys:
  - `itemId`, `sku`, `name`, `quantity`, `barcode`
- Shipment DTO keys:
  - `id`, `description`, `amount`, `scheduledFor`, `status`, `createdAt`, `updatedAt`
- Transaction DTO keys:
  - `id`, `itemId`, `itemName`, `machineId`, `slotNumber`, `amount`, `status`, `paymentMethod`, `userId`, `completedAt`, `refundedAt`, `createdAt`, `updatedAt`

## End-To-End Consistency Proof
- Seeded machine `M-101` cold brew quantity started at `4`.
- Creating a transaction reduced it to `3`.
- Refunding that same transaction restored it to `4`.
- The transaction contract stayed stable across create and refund.

## Remaining Follow-Up
- Flutter remains in the repo as legacy code and should only be revisited if it is brought back into the release path.
- Admin Center remains mock and non-operational until it is wired to live contracts.
- Fixture support still exists for non-operational and compatibility paths, but operational inventory, routes, shipments, and transactions are now cut to SQL-backed authority.
