# frozen_string_literal: true

module Api
  class RoutesController < Api::BaseController
    def routes
      render json: Route.includes(stops: :machine).order(:employee_name, :employee_id).map(&:payload)
    end

    def employees
      render json: Employee.order(:name, :id).map(&:payload)
    end
  end
end
