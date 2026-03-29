# frozen_string_literal: true

module SeedAuth
  USERS = {
    "mgr-01" => {
      "id" => "mgr-01",
      "name" => "Renee Goodman",
      "email" => "renee@aldervon.com",
      "role" => "manager",
      "organization_id" => "org_aldervon"
    },
    "emp-07" => {
      "id" => "emp-07",
      "name" => "Amanda Jones",
      "email" => "amanda.jones@example.com",
      "role" => "employee",
      "organization_id" => "org_aldervon"
    },
    "emp-11" => {
      "id" => "emp-11",
      "name" => "Luis Vega",
      "email" => "luis.vega@example.com",
      "role" => "employee",
      "organization_id" => "org_aldervon"
    }
  }.freeze

  TOKEN_PREFIX = "seed:session:"

  class << self
    def enabled?
      ActiveModel::Type::Boolean.new.cast(ENV["ALLOW_SEED_AUTH"])
    end

    def find_user_by_token(token)
      return nil unless enabled?
      return nil unless token.to_s.start_with?(TOKEN_PREFIX)

      user_id = token.to_s.delete_prefix(TOKEN_PREFIX)
      find_user_by_id(user_id)
    end

    def find_user_by_id(id)
      user = USERS[id.to_s]
      user&.dup
    end
  end
end
