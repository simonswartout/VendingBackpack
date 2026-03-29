# 07: Frontend Contract Adoption

## Goal
Move every shipped client that remains in scope onto the approved contract layer, without allowing screens or hooks to continue inventing their own operational DTOs.

## Implementation Status
- Implemented on `2026-03-29` for `Frontend-Next`
- Added shared operational contract definitions in `Frontend-Next/src/lib/api/contracts/operations.ts`
- Dashboard, routes, and warehouse flows were moved onto the canonical DTO layer
- Dashboard assignment data now comes from route truth instead of employee-index heuristics
- Seed auth session restore now attaches the bearer token to live API requests

## Current Reality
`Frontend-Next` is the strongest candidate for the primary client, but it still uses inline DTO shapes in routes, warehouse, and dashboard flows. The dashboard repository also derives assignment and status heuristically from partially related feeds. Flutter contains a second implementation of session, dashboard, routes, and warehouse flows using its own models and caching behavior.

## Target State
- Active client code consumes approved DTOs only.
- Entity mapping is centralized at the client boundary.
- Screens operate on stable view models, not raw unstable transport payloads.
- Inline transport-shape invention is removed from active operational screens.

## Adoption Rules
- Repositories or contract adapters own transport mapping.
- Screens own presentational derivation only.
- Role-based UI branching is allowed, but not role-based entity redefinition.
- No screen invents assignment, status, or quantity semantics that belong in domain or API layers.

## Priority Frontend Areas
- `Frontend-Next` routes
- `Frontend-Next` warehouse
- `Frontend-Next` dashboard
- `Frontend-Next` auth session payload mapping
- Flutter session and operational modules if Flutter remains in scope

## Implementation Sequence
1. Publish shared client-side contract definitions for active clients.
2. Move transport mapping out of screens and into boundary modules.
3. Replace inline DTO types in active Next operational features.
4. Replace heuristic dashboard derivations where canonical fields should exist.
5. Update Flutter to the same contracts in the same wave, or remove it from the shipping path.
6. Add regression coverage around manager and employee operational flows.

## Gate Criteria
- Active Next operational screens do not declare ad hoc transport DTOs inline.
- Active clients consume one approved route and inventory contract.
- Dashboard machine assignment and status behavior are explicitly owned by canonical data or centralized derivation.
- No shipped client depends on old transport aliases after cutover.

## Key Code Areas To Reference
- [Frontend-Next/src/features/routes/components/routes-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.tsx)
- [Frontend-Next/src/features/warehouse/components/warehouse-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/warehouse/components/warehouse-screen.tsx)
- [Frontend-Next/src/lib/api/repositories/api-dashboard-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/lib/api/repositories/api-dashboard-repository.ts)
- [Frontend-Next/src/lib/api/repositories/api-auth-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/lib/api/repositories/api-auth-repository.ts)
- [Frontend/lib/modules/dashboard/BusinessMetrics.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/dashboard/BusinessMetrics.dart)
- [Frontend/lib/modules/routes/RoutePlanner.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/routes/RoutePlanner.dart)
- [Frontend/lib/modules/warehouse/InventoryController.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/warehouse/InventoryController.dart)
- [Frontend/lib/modules/auth/SessionManager.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/auth/SessionManager.dart)
