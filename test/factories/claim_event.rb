# frozen_string_literal: true

FactoryBot.define do
  factory :claim_event do
    address_hash do
      script = CKB::Types::Script.new(code_hash: "#{ENV['SECP_CELL_TYPE_HASH']}", args: "0x#{SecureRandom.hex(20)}", hash_type: "type")

      CKB::Address.new(script, mode: CKB::MODE::TESTNET).generate
    end
    capacity { 10000 }
    fee { 0.00000548 }
    ip_addr { Faker::Internet.ip_v4_cidr }
    created_at_unixtimestamp { Time.current.to_i }

    trait :skip_validate do
      to_create { |instance| instance.save(validate: false) }
    end
  end
end
