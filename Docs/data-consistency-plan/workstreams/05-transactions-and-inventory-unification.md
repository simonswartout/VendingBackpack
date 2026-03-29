# 05: Transactions And Inventory Unification

## Goal
Fix the highest-risk operational split in the repo by forcing every inventory-affecting flow onto one canonical stock system.

## Implementation Status
- Implemented on `2026-03-29`
- Transaction create and refund now update canonical machine inventory through `InventoryAuthority`
- Warehouse add, machine fill, item CRUD, and vend/refund flows now operate on the same SQL-backed inventory truth
- Local Playwright validation confirmed `M-101` cold brew quantity moved `4 -> 3 -> 4` across create and refund

## Current Reality
The repo already has a stronger SQL-backed inventory model through `Item`, `MachineInventory`, `WarehouseMovement`, and `InventoryAuthority`. But transactions still mutate fixture-backed item data inside `TransactionsController`. That means stock changes can be recorded in one system while warehouse and machine inventory reads come from another, which is the clearest source-of-truth failure currently visible.

## Target State
- Warehouse stock lives in one canonical model.
- Machine stock lives in one canonical model.
- Every stock-changing action uses one shared rule set.
- Transactions and refunds affect the same authoritative inventory truth.
- Inventory movements are logged consistently.

## Flows To Unify
- item create
- item update
- item delete
- warehouse stock add
- warehouse stock adjustment
- machine fill
- machine return
- vend transaction
- refund
- barcode lookup

## Required Decisions
- Whether `Transaction` directly changes `Item` and `MachineInventory` or records a movement that drives those changes.
- Whether a vend is always machine-inventory-first.
- Whether refunds restore machine inventory, warehouse inventory, or a pending reconciliation state.
- Whether zero stock and availability are canonical stored fields or derived fields.

## Implementation Sequence
1. Trace every inventory-affecting flow from request to persistence to read-back.
2. Delete or replace the fixture-backed transaction path.
3. Define one authoritative stock adjustment model.
4. Align transaction, refund, warehouse add, and machine update logic with that model.
5. Align read endpoints so post-write reads always reflect the same persistence truth.
6. Expand integration coverage for all stock-changing flows.

## Gate Criteria
- No transaction flow mutates fixture-backed item records.
- A stock change is visible consistently in:
  - warehouse reads
  - machine inventory reads
  - transaction history
  - movement history
- Availability behavior is derived or stored consistently across all stock flows.

## Key Code Areas To Reference
- [Backend/app/services/inventory_authority.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/services/inventory_authority.rb)
- [Backend/app/controllers/api/transactions_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/transactions_controller.rb)
- [Backend/app/controllers/api/warehouse_controller.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/controllers/api/warehouse_controller.rb)
- [Backend/app/models/item.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/item.rb)
- [Backend/app/models/machine_inventory.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/machine_inventory.rb)
- [Backend/app/models/warehouse_movement.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/app/models/warehouse_movement.rb)
- [Backend/test/integration/warehouse_hardening_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/warehouse_hardening_test.rb)
- [Backend/test/integration/items_hardening_test.rb](/Users/crimsonwheeler/Documents/GitHub/VendingBackpack/Backend/test/integration/items_hardening_test.rb)
