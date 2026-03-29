# 02: Canonical Domain Contracts

## Goal
Define one approved business shape for each core entity before any endpoint or client is updated.

## Implementation Status
- Implemented on `2026-03-29`
- Backend payload builders now expose canonical DTOs for `Item`, `Machine`, `Employee`, `MachineInventory`, `Route`, `RouteStop`, `Shipment`, and `Transaction`
- `Frontend-Next` now consumes shared operational DTOs from `src/lib/api/contracts/operations.ts`
- Canonical external fields now include `quantity`, `slotNumber`, `machineId`, `employeeId`, `scheduledFor`, `createdAt`, and `updatedAt`

## Current Reality
The repo has strong backend candidates for canonical models, but they are not yet the whole system. The Rails backend uses `Item`, `MachineInventory`, `Route`, `Stop`, `Shipment`, and `Employee`, while `Frontend-Next` and Flutter still reshape those entities locally. The app therefore has multiple domain representations instead of one contract with controlled mappings.

## Contract Set To Freeze
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

## Required Fields To Decide For Each Entity
- canonical ID field
- canonical name and label fields
- canonical status field and allowed values
- canonical quantity field and units
- canonical timestamps
- canonical relationship fields
- canonical nullable fields
- canonical write rules

## Recommended Ownership Model
- Domain model:
  - logical business fields only
- Persistence model:
  - storage-specific columns and indexes only
- API DTO:
  - transport-safe contract with one naming convention
- UI model:
  - derived display state only

## Specific Decisions This Workstream Must Lock
- whether external contracts use `camelCase`
- whether `WarehouseInventory` is represented as item stock or as its own DTO wrapper
- whether `Transaction` directly changes stock or logs a separate inventory movement that stock derives from
- whether `RouteStop` owns sequence order and machine linkage only, with UI fields like `zone` and `serviceWindow` moved out of domain
- whether machine operational status is canonical data or view-model derivation

## Implementation Sequence
1. Inventory the current shapes from backend models, backend payload builders, Next inline types, and Flutter models.
2. Collapse each entity into one approved domain contract.
3. Mark fields as one of:
   - canonical domain
   - persistence-only
   - transport-only
   - UI-only
4. Record disallowed aliases and legacy field names.
5. Publish the final contract table for implementation work.

## Gate Criteria
- Each in-scope entity has one approved domain contract.
- Each field is classified by layer ownership.
- Legacy aliases are explicitly marked for removal.
- No entity still has an unresolved “maybe shape.”

## Key Code Areas To Reference
- [Backend/app/models/item.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/item.rb)
- [Backend/app/models/machine_inventory.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/machine_inventory.rb)
- [Backend/app/models/route.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/route.rb)
- [Backend/app/models/stop.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/stop.rb)
- [Backend/app/models/employee.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/employee.rb)
- [Frontend-Next/src/features/warehouse/components/warehouse-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/warehouse/components/warehouse-screen.tsx)
- [Frontend-Next/src/features/routes/components/routes-screen.tsx](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend-Next/src/features/routes/components/routes-screen.tsx)
- [Frontend/lib/modules/warehouse/InventoryItem.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/modules/warehouse/InventoryItem.dart)
- [Frontend/lib/core/models/User.dart](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Frontend/lib/core/models/User.dart)
