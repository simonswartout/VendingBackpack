# 09: Validation And Cutover Gates

## Goal
Define the validation bar that must be met before the contract overhaul is considered releasable.

## Implementation Status
- Implemented on `2026-03-29`
- Frontend validation passed:
  - `cd Frontend-Next && npx tsc --noEmit`
  - `cd Frontend-Next && npm test`
- Backend validation passed in Docker:
  - `docker run --rm -e RAILS_ENV=test --entrypoint /bin/sh vendingbackpack/backend:local -lc "./bin/rails db:prepare && ./bin/rails test"`
- Playwright validation passed on the seeded local Docker stack for manager and employee operational flows

## Local Validation Evidence
- Manager dashboard loaded live counts for machines, employees, routes, and revenue
- Manager routes loaded live assignments and employee list from the normalized route contract
- Manager warehouse loaded live stock, shipments, and barcode lookups from the normalized inventory contract
- Employee dashboard loaded only assigned-route metrics and route-backed machine inventory
- Employee routes loaded the same route DTO shape with manager controls hidden
- Transaction create and refund round-tripped inventory consistency on the live local stack

## Current Reality
The backend already has useful integration coverage for routes, warehouse hardening, item hardening, auth parity, and preference normalization. The Next app also has focused tests around routes, warehouse behavior, and dashboard partial-feed behavior. What is missing is a single release gate that proves all active clients and all operational flows are running on one contract and one source of truth.

## Required Validation Layers
- contract validation
- backend integration validation
- persistence validation
- client regression validation
- role parity validation
- cutover and release validation

## Minimum Backend Validation Matrix
- item create, update, delete
- warehouse add stock
- machine fill and return
- barcode lookup
- transaction create
- transaction refund
- route list and employee route read
- route assign and reorder
- manager and employee access boundaries

## Minimum Client Validation Matrix
- manager warehouse flow
- employee warehouse restrictions
- manager route assignment flow
- employee route view flow
- dashboard consistency after stock and route changes
- any retained Flutter operational flow

## Cutover Rules
- No release if any active client still depends on legacy DTO aliases.
- No release if fixture-backed data can still change live operational truth.
- No release if a stock-changing action is not reflected consistently in follow-up reads.
- No release if manager and employee views disagree on the same canonical record.

## Implementation Sequence
1. Translate approved contracts into test expectations.
2. Expand backend integration coverage for all in-scope write and read paths.
3. Expand client regression coverage for role-based operational flows.
4. Add explicit checks for legacy fixture non-authority.
5. Run a final cutover checklist against the chosen production surface set.

## Gate Criteria
- Contract tests pass for every in-scope endpoint.
- Integration tests prove canonical persistence after writes.
- Client regressions pass on every shipped surface.
- No legacy or fixture path remains in operational release behavior.
- Release sign-off includes explicit confirmation of source-of-truth ownership.

## Key Code Areas To Reference
- [Backend/test/integration/warehouse_hardening_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/warehouse_hardening_test.rb)
- [Backend/test/integration/items_hardening_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/items_hardening_test.rb)
- [Backend/test/integration/routes_consistency_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/routes_consistency_test.rb)
- [Backend/test/integration/auth_parity_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/auth_parity_test.rb)
- [Frontend-Next/src/features/routes/components/routes-screen.test.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.test.tsx)
- [Frontend-Next/src/features/warehouse/components/warehouse-screen.test.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/warehouse/components/warehouse-screen.test.tsx)
- [Frontend-Next/src/lib/api/repositories/api-dashboard-repository.test.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/lib/api/repositories/api-dashboard-repository.test.ts)
