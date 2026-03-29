class MachineInventory < ApplicationRecord
  belongs_to :machine, foreign_key: :machine_id, primary_key: :id
  belongs_to :item

  validates :quantity, numericality: { greater_than_or_equal_to: 0 }

  def payload
    {
      "itemId" => item.id,
      "sku" => item.sku,
      "name" => item.name,
      "quantity" => quantity,
      "barcode" => item.barcode,
      "slotNumber" => item.slot_number
    }
  end
end
