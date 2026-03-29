class Shipment < ApplicationRecord
  validates :description, presence: true
  validates :amount, numericality: { greater_than: 0 }
  validates :scheduled_for, presence: true
  validates :status, presence: true

  def payload
    {
      "id" => id,
      "description" => description,
      "amount" => amount,
      "scheduledFor" => scheduled_for.iso8601,
      "status" => status,
      "createdAt" => created_at&.iso8601,
      "updatedAt" => updated_at&.iso8601
    }
  end
end
