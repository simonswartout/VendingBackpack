# 03: Backend Source Of Truth Cutover

## Goal
Make the Rails backend the unambiguous live authority for every in-scope operational entity.

## Implementation Status
- Implemented on `2026-03-29`
- Added SQL-backed `VendingTransaction` persistence and migration
- Moved transaction create and refund flows onto `InventoryAuthority`
- Operational inventory, routes, shipments, and transactions now read and write through SQL-backed models
- Fixture helpers remain only for seed, test, or compatibility paths outside the active operational cutover

## Current Reality
The backend already has SQL-backed models and migrations for most operational data, but fixture-era storage still remains active in live code. `InventoryAuthority` uses SQL-backed models for inventory, routes use SQL-backed models, and preferences use SQL-backed records, but `TransactionsController`, parts of auth and organization flow, and `Fixtures::MockApi` / `Fixtures::MutableStore` still create competing persistence behavior.

## Target State
- SQL-backed ActiveRecord models own every live operational entity in scope.
- Fixtures are limited to:
  - tests
  - seeding
  - explicitly non-production demo data
- No live controller or service writes operational truth to JSON fixture files.

## Backend Areas To Resolve
- inventory authority path
- transaction persistence path
- route persistence path
- employee parity checks
- auth and organization persistence for any data still needed in production
- corporate snapshot source if it remains live

## High-Risk Live Hybrid Paths
- `TransactionsController` reading and mutating fixture-backed items
- `Fixtures::MutableStore` still supporting active writes
- `Fixtures::MockApi` still serving live auth-adjacent data
- seed and runtime behavior still sharing fixture concepts without a clear boundary

## Implementation Sequence
1. Enumerate every live controller and service still touching fixture-backed data.
2. Classify each fixture path as:
   - delete
   - seed-only
   - replace with SQL model
3. Move live operational writes onto canonical models.
4. Move corresponding reads onto the same canonical models.
5. Keep fixture loading only where it is clearly test or seed infrastructure.
6. Add explicit boundaries so runtime code cannot silently fall back to fixture authority.

## Gate Criteria
- No in-scope live controller writes through `Fixtures::MutableStore`.
- No in-scope live read path bypasses the canonical persistence model.
- SQL is the only authoritative live store for in-scope operational entities.
- Fixtures remain only where their role is documented as seed or test support.

## Key Code Areas To Reference
- [Backend/app/services/inventory_authority.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/inventory_authority.rb)
- [Backend/app/controllers/api/transactions_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/transactions_controller.rb)
- [Backend/app/controllers/api/warehouse_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/warehouse_controller.rb)
- [Backend/app/controllers/api/employees_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/employees_controller.rb)
- [Backend/app/controllers/api/auth_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/auth_controller.rb)
- [Backend/app/services/fixtures/mutable_store.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/fixtures/mutable_store.rb)
- [Backend/app/services/fixtures/mock_api.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/fixtures/mock_api.rb)
- [Backend/db/migrate/20260312000002_harden_inventory_authority.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/db/migrate/20260312000002_harden_inventory_authority.rb)
