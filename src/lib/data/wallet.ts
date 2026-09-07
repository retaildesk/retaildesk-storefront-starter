"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export async function topupWallet(amount: number, providerId: string) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }
    const response = await sdk.client.fetch(`/store/customers/wallet/topup`, {
      method: "POST",
      headers,
      body: {
        amount,
        provider_id: providerId,
      },
    })
    return response as { checkout_url: string }
  } catch (error) {
    console.error("Failed to topup wallet:", error)
    throw error
  }
}

export type WalletHistoryEntry = {
  id: string
  type: "topup" | "spend"
  label: string
  amount: number
  order_id: string | null
  created_at: string
}

export async function fetchWalletHistory(noCache = false) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }
    const response = await sdk.client.fetch(`/store/customers/wallet/history`, {
      method: "GET",
      headers,
      ...(noCache ? { cache: "no-store" as const } : {}),
    })
    return response as { entries: WalletHistoryEntry[] }
  } catch (error) {
    console.error("Failed to fetch wallet history:", error)
    return { entries: [] }
  }
}

export async function fetchPaymentProviders() {
  try {
    const response = await sdk.client.fetch(`/store/payment-providers`, {
      method: "GET",
    })
    return response as { payment_providers: { id: string }[] }
  } catch (error) {
    console.error("Failed to fetch payment providers:", error)
    return { payment_providers: [] }
  }
}
