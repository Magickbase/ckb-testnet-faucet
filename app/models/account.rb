# frozen_string_literal: true

class Account < ApplicationRecord
  validates_presence_of :address_hash, :balance
  validates :balance, numericality: { greater_than_or_equal_to: 0 }

  MAX_CAPACITY_PER_MONTH = 300_000 * 10 ** 8

  def self.official_account
    first
  end

  def ckb_balance
    (BigDecimal(balance) / 10**8).round(2)
  end
end

# == Schema Information
#
# Table name: accounts
#
#  id           :bigint           not null, primary key
#  address_hash :string
#  balance      :decimal(30, )    default(0)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_accounts_on_address_hash  (address_hash) UNIQUE
#
