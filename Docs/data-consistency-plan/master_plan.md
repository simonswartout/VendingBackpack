# Data Consistency Master Plan

## Purpose
This plan is for a pre-production, one-shot overhaul focused on data consistency, contract stability, and source-of-truth cleanup. The target is to freeze one canonical contract for the core operational domains, cut every shipped surface onto that contract, and remove or quarantine anything that still behaves like a parallel truth system.

## Folder Shape
```text
Docs/data-consistency-plan/
  master_plan.md
  workstreams/
    01-target-state-and-constraints.md
    02-canonical-domain-contracts.md
    03-backend-source-of-truth-cutover.md
    04-api-contract-normalization.md
    05-transactions-and-inventory-unification.md
    06-routes-and-role-alignment.md
    07-frontend-contract-adoption.md
    08-legacy-client-and-admin-scope.md
    09-validation-and-cutover-gates.md
```

## Status Overview
- Status date: `2026-03-29`
- Operational cutover target: implemented for `Backend` + `Frontend-Next`
- External contract naming: `camelCase`
- Live operational authority: Rails + SQL-backed models
- Local seeded validation: completed through Docker and Playwright
- Legacy scope decision: Flutter removed from production publish workflow, Admin Center remains internal/mock

## Why This Is Next
The repo is already showing the exact pre-production failure pattern this plan is meant to stop: SQL-backed operational models exist, but fixture-backed stores are still active in live backend code; `Frontend-Next`, `Frontend-Admin-Center`, and the Flutter client each define overlapping domain shapes; and route, inventory, and transaction flows still use multiple payload styles. If the team starts patching screens before freezing the contract, the app will become cleaner-looking without becoming more consistent.

## In Scope
- Core operational entities:
  - `Machine`
  - `Employee`
  - `Item`
  - `WarehouseInventory`
  - `MachineInventory`
  - `Route`
  - `RouteStop`
  - `Shipment`
  - `Transaction`
  - `InventoryMovement`
- Active backend contract surfaces:
  - warehouse
  - items
  - machines
  - routes
  - employees
  - transactions
- Active clients:
  - `Frontend-Next`
  - `Frontend` if still shipped
- Release decision surface:
  - `Frontend-Admin-Center` for any operational data it may later consume

## Out Of Scope
- UI redesign
- styling cleanup
- performance tuning unrelated to contract flow
- generalized helper cleanup with no contract impact
- hardware and firmware behavior changes
- dashboard preference UX unless affected by core contract naming

## Target Output Shape
The end state for this overhaul is:

1. One canonical domain definition for each in-scope entity.
2. One authoritative live persistence path per in-scope entity.
3. One stable API DTO shape per request and response.
4. One mapping boundary between persistence, domain, API, and UI.
5. One naming convention for all external contracts.
6. One status vocabulary per domain concept.
7. One quantity and unit policy per inventory concept.

## Hard Constraints
- No live dual-write behavior.
- No fixture-backed live writes for operational data.
- No mixed `qty` and `quantity` in external contracts.
- No mixed `employee_id` and `employeeId` in external contracts.
- No endpoint that returns a list in one flow and an object in another.
- No UI-owned source-of-truth fields.
- No heuristic assignment or status fields where canonical data should exist.
- No client can ship on the old contract once cutover is complete.

## Recommended Sequence
1. Freeze target-state and constraints.
2. Define canonical entity contracts.
3. Make backend persistence authoritative.
4. Normalize request and response DTOs.
5. Unify transactions with inventory.
6. Align routes and role behavior.
7. Move active clients to the contract.
8. Decide legacy and mock surface scope.
9. Run cutover validation gates.

## Master Checklist

### Phase 1: Target State
- [x] Approve the target-state rules in [01-target-state-and-constraints.md](workstreams/01-target-state-and-constraints.md).
- [x] Lock the in-scope entities and the out-of-scope list.
- [x] Approve one external naming convention for every live contract.

Gate:
- Every team member can answer which domains are in scope, which clients are in scope, and which naming standard is final.

### Phase 2: Canonical Contracts
- [x] Complete the entity-by-entity contract definitions in [02-canonical-domain-contracts.md](workstreams/02-canonical-domain-contracts.md).
- [x] Confirm which fields are domain fields versus DTO-only or UI-only.
- [x] Confirm canonical IDs, quantities, statuses, units, and timestamps.

Gate:
- Each in-scope entity has one approved contract shape and one approved ownership model.

### Phase 3: Backend Authority
- [x] Complete the backend authority plan in [03-backend-source-of-truth-cutover.md](workstreams/03-backend-source-of-truth-cutover.md).
- [x] Mark every fixture-backed live path for removal, quarantine, or seed-only use.
- [x] Mark every controller and service that still bypasses canonical persistence.

Gate:
- No live backend write path remains ambiguous about where the authoritative record is stored.

### Phase 4: API Normalization
- [x] Complete the API DTO plan in [04-api-contract-normalization.md](workstreams/04-api-contract-normalization.md).
- [x] Define stable request and response DTOs for every in-scope endpoint.
- [x] Define one consistent error response shape.

Gate:
- Every in-scope endpoint has one approved transport contract and no compatibility ambiguity.

### Phase 5: Inventory and Transactions
- [x] Complete the inventory and transaction plan in [05-transactions-and-inventory-unification.md](workstreams/05-transactions-and-inventory-unification.md).
- [x] Ensure vend, refund, warehouse add, machine fill, and item adjustment all use the same canonical inventory system.
- [x] Confirm movement logging requirements.

Gate:
- A single end-to-end stock change is visible consistently across warehouse, machine, and transaction reads.

### Phase 6: Routes and Roles
- [x] Complete the route and role alignment plan in [06-routes-and-role-alignment.md](workstreams/06-routes-and-role-alignment.md).
- [x] Define one route payload contract for manager and employee flows.
- [x] Separate permission differences from entity-shape differences.

Gate:
- Manager and employee flows read the same route truth and differ only in allowed actions and view-model output.

### Phase 7: Client Adoption
- [x] Complete the client adoption plan in [07-frontend-contract-adoption.md](workstreams/07-frontend-contract-adoption.md).
- [x] Remove inline DTO invention from active Next screens and repositories.
- [x] Decide whether Flutter is updated in the same wave or removed from the shipping path.

Gate:
- Every shipped client reads and writes through the approved contract layer.

### Phase 8: Legacy and Mock Scope
- [x] Complete the legacy scope plan in [08-legacy-client-and-admin-scope.md](workstreams/08-legacy-client-and-admin-scope.md).
- [x] Explicitly decide the disposition of Flutter, fixture-era helpers, and Admin Center mock repositories.
- [x] Record what is deleted, what becomes seed-only, and what remains active.

Gate:
- No ambiguous legacy surface remains in the release path.

### Phase 9: Validation and Cutover
- [x] Complete the final validation plan in [09-validation-and-cutover-gates.md](workstreams/09-validation-and-cutover-gates.md).
- [x] Run contract, integration, and end-to-end validation gates.
- [x] Confirm that fixture data is not acting as live authority.

Gate:
- The system passes contract, persistence, and client-behavior validation under the new model before production release.

## Current Repo Signals Behind This Plan
- Rails already has canonical-looking SQL models for `Item`, `MachineInventory`, `Route`, `Stop`, `Shipment`, and `UserPreference`.
- The backend still has active fixture-backed paths through `Fixtures::MutableStore`, `Fixtures::MockApi`, and `TransactionsController`.
- `Frontend-Next` consumes several operational DTOs inline and defensively handles multiple route shapes.
- The Flutter client still contains parallel route, dashboard, warehouse, and session logic.
- The Admin Center is mostly local/mock and should be treated as a scope decision, not an implicit live contract consumer.

## Success Definition
This effort is complete when the same real-world record has one approved contract shape, one source of truth, one live persistence path, one response contract, and one client behavior across all shipped surfaces.

## Validation Snapshot
- Frontend typecheck passed: `cd Frontend-Next && npx tsc --noEmit`
- Frontend tests passed: `cd Frontend-Next && npm test`
- Backend tests passed in Docker: `31 runs, 139 assertions, 0 failures`
- Local seeded Docker stack validated at `http://localhost:9100`
- Playwright validated:
  - manager dashboard
  - manager routes
  - manager warehouse
  - employee dashboard
  - employee routes
  - transaction create/refund inventory consistency
