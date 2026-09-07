import { Metadata } from "next"
import { notFound } from "next/navigation"

import WalletTemplate from "@modules/account/components/wallet"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Wallet",
  description: "Manage your Retaildesk wallet balance and top-up.",
}

export default async function Wallet() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return <WalletTemplate customer={customer} />
}
