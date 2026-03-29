# 01: Target State And Constraints

## Goal
Freeze the rules of the overhaul before any implementation work starts. This is the document that prevents partial cleanups, compatibility drift, and scope creep.

## Implementation Status
- Implemented on `2026-03-29`
- External operational contracts now use `camelCase`
- Backend owns operational truth, API owns transport truth, UI owns view-only derivation
- `Frontend-Next` is the production operational surface
- Flutter is no longer in the production publish workflow

## Current Reality
The repo currently mixes SQL-backed Rails models, fixture-backed backend data, inline TypeScript DTOs, Dart models, and Admin Center mock repositories. That means the app does not fail because one screen is messy; it fails because different layers are allowed to invent the same entity differently.

## Target State
The target state for the overhaul is:

- Canonical domain model:
  - one approved logical definition for each in-scope entity
- Canonical persistence:
  - one authoritative live store per entity
- Canonical API contract:
  - one request and one response shape per endpoint
- Canonical client usage:
  - one client-facing shape per entity across shipped apps

## Mandatory Contract Rules
- External API naming uses one convention only.
- External contract fields are stable and explicit.
- Route payload shape is identical across manager and employee reads.
- Inventory quantity rules are shared across warehouse, machine, and transaction flows.
- Role controls permissions and view composition, not entity shape.
- UI-only fields are derived in view models and never become persistence truth.

## In-Scope Entities
- `Machine`
- `Employee`
- `Item`
- `WarehouseInventory`
- `MachineInventory`
- `InventoryMovement`
- `Route`
- `RouteStop`
- `Shipment`
- `Transaction`

## Constraints
- No fixture-backed live writes for in-scope entities.
- No parallel live transaction logic.
- No inline DTO creation in active clients for in-scope entities.
- No mixed naming such as `qty` and `quantity` in external contracts.
- No mixed casing such as `employee_id` and `employeeId` in external contracts.
- No endpoint that sometimes returns a list and sometimes returns an object.
- No role-specific base entity definitions.
- No compatibility adapters kept past cutover unless explicitly documented as temporary.

## Explicit Non-Goals
- Visual parity cleanup
- shell or navigation redesign
- component deduplication that does not affect data contracts
- firmware protocol redesign
- performance work unrelated to data consistency

## Implementation Sequence
1. Approve the list of in-scope entities.
2. Approve one external naming standard.
3. Approve one contract ownership rule:
   - backend owns domain and persistence truth
   - API owns transport truth
   - UI owns view-model-only truth
4. Approve the disposition rule for legacy surfaces:
   - update to contract in this wave
   - or remove from shipping path
5. Freeze these rules before implementation tickets begin.

## Gate Criteria
- Every in-scope entity is named and accepted.
- Every team member knows which layer owns which truth.
- The overhaul has a written out-of-scope list.
- The plan explicitly forbids fixture-backed live authority for operational data.

## Key Code Areas To Reference
- [Backend/app/services/inventory_authority.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/inventory_authority.rb)
- [Backend/app/services/fixtures/mutable_store.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/fixtures/mutable_store.rb)
- [Frontend-Next/src/features/routes/components/routes-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.tsx)
- [Frontend/lib/modules/routes/RoutePlanner.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/routes/RoutePlanner.dart)
- [Frontend-Admin-Center/src/features/machine-config/components/machine-config-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Admin-Center/src/features/machine-config/components/machine-config-screen.tsx)
