# 08: Legacy Client And Admin Scope

## Goal
Remove ambiguity around which clients and support layers must conform to the new data contract before production.

## Implementation Status
- Implemented on `2026-03-29`
- `Frontend-Next` is the operational release client
- Flutter was removed from the production publish workflow and remains legacy repo code only
- Admin Center remains internal/mock and is not treated as an operational live contract surface
- Fixture helpers are retained only for seed, test, and compatibility support outside the active release path

## Current Reality
The repo still builds a Flutter frontend image in CI, the Flutter app still contains operational data flows, and the Admin Center uses local repositories and mock machine-config data. That means the repo is carrying multiple product surfaces, but not all of them are equally authoritative or equally production-ready.

## Scope Decision To Make
Each surface must be classified as one of:
- ship and conform
- ship read-only
- internal-only demo
- seed-only tooling
- remove from release path

## Surfaces Requiring Explicit Decisions
- `Frontend-Next`
- `Frontend`
- `Frontend-Admin-Center`
- fixture-backed backend helpers

## Recommended Production Bias
- `Frontend-Next`:
  - keep and conform
- `Frontend`:
  - either conform in the same wave or remove from release
- `Frontend-Admin-Center`:
  - keep clearly non-operational until a real contract-backed implementation exists
- fixture helpers:
  - keep seed/test only where still useful

## Implementation Sequence
1. Decide which client is the primary operational release surface.
2. Decide whether Flutter is updated in the same contract cutover or retired from release.
3. Decide whether Admin Center consumes live operational data in this phase.
4. Mark non-authoritative surfaces and helpers for deletion, quarantine, or seed-only use.
5. Reflect those decisions in deployment and validation plans.

## Gate Criteria
- There is a written shipping decision for each client surface.
- No legacy client remains implicitly supported.
- No mock or seed layer remains ambiguously positioned as a live production dependency.
- Deployment targets match the chosen surface scope.

## Key Code Areas To Reference
- [publish-ghcr.yml](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/.github/workflows/publish-ghcr.yml)
- [docker-compose.yml](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/docker-compose.yml)
- [Frontend/lib/modules/layout/PagesLayout.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/layout/PagesLayout.dart)
- [Frontend-Admin-Center/src/features/overview/lib/local-overview-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Admin-Center/src/features/overview/lib/local-overview-repository.ts)
- [Frontend-Admin-Center/src/features/fleet/lib/local-fleet-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Admin-Center/src/features/fleet/lib/local-fleet-repository.ts)
- [Frontend-Admin-Center/src/features/machine-config/lib/mock-machine-config-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Admin-Center/src/features/machine-config/lib/mock-machine-config-repository.ts)
- [Backend/app/services/fixtures/mutable_store.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/fixtures/mutable_store.rb)
