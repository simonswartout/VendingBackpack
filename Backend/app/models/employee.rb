class Employee < ApplicationRecord
  self.primary_key = :id
  has_one :route, dependent: :destroy

  def payload
    {
      "id" => id,
      "name" => name,
      "color" => color,
      "department" => department,
      "location" => location,
      "floor" => floor,
      "building" => building,
      "isActive" => is_active,
      "createdAt" => created_at&.iso8601,
      "updatedAt" => updated_at&.iso8601
    }
  end
end
