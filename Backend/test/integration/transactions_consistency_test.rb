require "test_helper"

class TransactionsConsistencyTest < ActionDispatch::IntegrationTest
  setup do
    VendingTransaction.delete_all
    WarehouseMovement.delete_all
    MachineInventory.delete_all
    Item.delete_all
    Stop.delete_all
    Route.delete_all
    Machine.delete_all
    Employee.delete_all
  end

  test "creating a transaction decrements machine inventory and appears in daily stats" do
    machine = Machine.create!(id: "M-701", name: "Machine 701", lat: 1.0, lng: 2.0)
    item = Item.create!(sku: "cold_brew", name: "Cold Brew", warehouse_quantity: 8, barcode: "111", price: 4.25, slot_number: "A1", is_available: true)
    MachineInventory.create!(machine: machine, item: item, quantity: 3)

    post "/api/transactions",
         params: { itemId: item.id, machineId: machine.id, paymentMethod: "card", userId: "emp-07" }.to_json,
         headers: manager_headers

    assert_response :created
    assert_equal item.id, json_response.fetch("itemId")
    assert_equal machine.id, json_response.fetch("machineId")
    assert_equal "completed", json_response.fetch("status")
    assert_equal 2, MachineInventory.find_by!(machine_id: machine.id, item_id: item.id).quantity

    get "/api/daily_stats", headers: manager_headers
    assert_response :success
    assert_operator json_response.last.fetch("amount"), :>=, 4.25
    assert_operator json_response.last.fetch("transactionCount"), :>=, 1
  end

  test "refunding a transaction restores machine inventory" do
    machine = Machine.create!(id: "M-702", name: "Machine 702", lat: 1.0, lng: 2.0)
    item = Item.create!(sku: "sparkling_water", name: "Sparkling Water", warehouse_quantity: 6, barcode: "222", price: 2.75, slot_number: "A2", is_available: true)
    MachineInventory.create!(machine: machine, item: item, quantity: 2)

    post "/api/transactions",
         params: { itemId: item.id, machineId: machine.id, paymentMethod: "card", userId: "emp-11" }.to_json,
         headers: manager_headers

    assert_response :created
    transaction_id = json_response.fetch("id")
    assert_equal 1, MachineInventory.find_by!(machine_id: machine.id, item_id: item.id).quantity

    post "/api/transactions/#{transaction_id}/refund", headers: manager_headers

    assert_response :success
    assert_equal "refunded", json_response.fetch("status")
    assert_equal 2, MachineInventory.find_by!(machine_id: machine.id, item_id: item.id).quantity
  end
end
