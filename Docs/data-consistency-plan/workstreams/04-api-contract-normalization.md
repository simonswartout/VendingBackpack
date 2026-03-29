# 04: API Contract Normalization

## Goal
Define and enforce one stable transport contract per endpoint for every in-scope operational flow.

## Implementation Status
- Implemented on `2026-03-29`
- Operational request and response DTOs were normalized to `camelCase`
- Standard error responses now use `{ "detail": "..." }`
- Barcode lookup was moved to `/api/items/barcode/:barcode` to avoid collision with numeric item IDs
- Manager and employee route endpoints now return the same route container shape

## Current Reality
The backend payloads are still assembled ad hoc in several places, and clients defensively handle multiple shapes. Examples already visible in the repo include `qty` versus `quantity`, `employee_id` versus `employeeId`, and route responses treated as either a single object or a list depending on client code. That is a contract problem, not just a frontend cleanup problem.

## Target State
- One request DTO per endpoint.
- One response DTO per endpoint.
- One external naming convention across all operational endpoints.
- One error response shape.
- No compatibility branches in clients for old payload styles after cutover.

## Endpoints That Need Explicit DTO Freezing
- `/warehouse`
- `/inventory`
- `/warehouse/update`
- `/warehouse/add_stock`
- `/warehouse/shipments`
- `/items`
- `/items/:id`
- `/items/:barcode`
- `/machines`
- `/routes`
- `/employees`
- `/employees/routes`
- `/employees/:id/routes`
- `/employees/:id/routes/assign`
- `/employees/:id/routes/stops`
- `/transactions`
- `/transactions/:id`
- `/transactions/:id/refund`

## Contract Rules
- External DTO names do not mirror internal storage quirks.
- Transport DTOs are versionable and intentional.
- Error payloads always use the same envelope shape.
- No endpoint response can switch container type by role or client.
- Manager and employee endpoints may differ in access and allowed operations, not in base entity semantics.

## Implementation Sequence
1. Capture the current transport shapes endpoint by endpoint.
2. Mark every field alias and ambiguous shape for removal.
3. Publish the approved DTO set.
4. Align backend serializers or payload builders to the DTO set.
5. Align every active client to the same DTO set.
6. Remove compatibility handling once all active clients are cut over.

## Gate Criteria
- Every in-scope endpoint has an approved request and response DTO.
- Error handling uses one envelope shape.
- No active client must branch on old transport aliases.
- No endpoint still returns a role-dependent container shape.

## Key Code Areas To Reference
- [Backend/config/routes.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/config/routes.rb)
- [Backend/app/controllers/api/warehouse_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/warehouse_controller.rb)
- [Backend/app/controllers/api/items_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/items_controller.rb)
- [Backend/app/controllers/api/machines_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/machines_controller.rb)
- [Backend/app/controllers/api/routes_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/routes_controller.rb)
- [Backend/app/controllers/api/employees_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/employees_controller.rb)
- [Frontend-Next/src/lib/api/repositories/api-auth-repository.ts](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/lib/api/repositories/api-auth-repository.ts)
- [Frontend-Next/src/features/routes/components/routes-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.tsx)
- [Frontend/lib/modules/routes/RoutePlanner.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/routes/RoutePlanner.dart)
