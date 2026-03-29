class Stop < ApplicationRecord
  belongs_to :route
  belongs_to :machine

  def payload
    {
      "machineId" => machine.id,
      "name" => machine.name,
      "lat" => machine.lat,
      "lng" => machine.lng,
      "location" => machine.location,
      "position" => position
    }
  end
end
