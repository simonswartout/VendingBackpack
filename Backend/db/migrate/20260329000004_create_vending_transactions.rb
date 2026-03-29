class CreateVendingTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :vending_transactions do |t|
      t.references :item, null: false, foreign_key: true
      t.string :machine_id
      t.string :slot_number
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :status, null: false, default: "completed"
      t.string :payment_method
      t.string :user_id
      t.datetime :completed_at, null: false
      t.datetime :refunded_at
      t.timestamps
    end

    add_foreign_key :vending_transactions, :machines, column: :machine_id, primary_key: :id
    add_index :vending_transactions, :machine_id
    add_index :vending_transactions, :status
  end
end
