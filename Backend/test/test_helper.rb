ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

class ActiveSupport::TestCase
  parallelize(workers: 1)
end

class ActionDispatch::IntegrationTest
  private

  def with_stubbed_user(user)
    real_api = Fixtures::MockApi.new
    fake_api = Object.new
    fake_api.define_singleton_method(:find_user_by_id) do |id|
      id.to_s == user.fetch("id").to_s ? user : nil
    end
    fake_api.define_singleton_method(:method_missing) do |name, *args, &block|
      raise NoMethodError, "undefined method `#{name}` for #{self}" unless real_api.respond_to?(name)

      real_api.public_send(name, *args, &block)
    end
    fake_api.define_singleton_method(:respond_to_missing?) do |name, include_private = false|
      real_api.respond_to?(name, include_private)
    end

    original_new = Fixtures::MockApi.method(:new)
    Fixtures::MockApi.define_singleton_method(:new) do |*_args, **_kwargs, &_block|
      fake_api
    end

    yield
  ensure
    Fixtures::MockApi.define_singleton_method(:new, original_new)
  end

  def manager_headers
    auth_headers(user_id: "user_admin", role: "manager", organization_id: "org_aldervon")
  end

  def employee_headers(user_id:, organization_id: "org_aldervon")
    auth_headers(user_id: user_id, role: "employee", organization_id: organization_id)
  end

  def auth_headers(user_id:, role:, organization_id:)
    token = Rails.application.message_verifier(:access_token).generate(
      {
        "sub" => user_id,
        "role" => role,
        "organization_id" => organization_id,
        "exp" => Time.now.to_i + 3600
      }
    )

    {
      "Authorization" => "Bearer #{token}",
      "Content-Type" => "application/json"
    }
  end

  def json_response
    JSON.parse(response.body)
  end
end
