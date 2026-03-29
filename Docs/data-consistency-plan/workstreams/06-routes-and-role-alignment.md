# 06: Routes And Role Alignment

## Goal
Make route data one stable contract shared by manager and employee flows, with role differences limited to permissions and view behavior.

## Implementation Status
- Implemented on `2026-03-29`
- Manager and employee route reads now share the same route DTO shape
- `Frontend-Next` no longer branches on mixed `employee_id` and `employeeId`
- Manager-only assignment controls are separated from the shared route entity shape
- Local Playwright validation confirmed employee route reads return the same `Route` and `RouteStop` fields as manager route reads

## Current Reality
Routes are backed by SQL models and already have backend consistency tests, but the client contract is still unstable. `Frontend-Next` handles route records using mixed snake_case and camelCase fields, while Flutter accepts route reads as either a single object or a list. The manager and employee route screens also load different endpoint combinations and derive some state locally.

## Target State
- One route entity shape.
- One route stop shape.
- One employee route summary shape.
- One container shape per route endpoint.
- Role affects:
  - what actions are allowed
  - what UI controls are visible
- Role does not affect:
  - base route entity semantics
  - field naming
  - container structure

## Route Areas To Normalize
- machine list used by route planning
- employee list used by route assignment
- route summary list
- employee-specific assigned route
- assignment write response
- route stop reorder response
- route autogeneration response

## Required Decisions
- Whether route responses always return route records with embedded ordered stops.
- Whether route planning map data is a route DTO or a UI projection.
- Whether `zone` and `serviceWindow` remain UI-only derived fields unless stored canonically.
- Whether employee route reads always return an object with a stable `stops` array.

## Implementation Sequence
1. Freeze the canonical route and route-stop contracts.
2. Freeze request and response shapes for every route endpoint.
3. Remove mixed field aliases from active clients.
4. Remove map-or-list response ambiguity from Flutter and any other client.
5. Align manager and employee reads to the same underlying route truth.
6. Expand route integration and UI validation around assignment, reorder, and autogeneration.

## Gate Criteria
- No active client must accept both `employee_id` and `employeeId`.
- No active client must accept both route-object and route-list responses for the same endpoint.
- Manager and employee route reads resolve to the same canonical route data.
- Route-assignment state shown in UI is backed by canonical data, not heuristic inference.

## Key Code Areas To Reference
- [Backend/app/controllers/api/routes_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/routes_controller.rb)
- [Backend/app/controllers/api/employees_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/employees_controller.rb)
- [Backend/app/models/route.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/route.rb)
- [Backend/app/models/stop.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/stop.rb)
- [Backend/test/integration/routes_consistency_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/routes_consistency_test.rb)
- [Frontend-Next/src/features/routes/components/routes-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.tsx)
- [Frontend/lib/modules/routes/RoutePlanner.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/routes/RoutePlanner.dart)
- [Frontend/lib/modules/routes/MapInterface.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/routes/MapInterface.dart)
