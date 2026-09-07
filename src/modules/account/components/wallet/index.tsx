"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button, Container, Heading, Text, Input, clx } from "@medusajs/ui"
import { RadioGroup } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { paymentInfoMap } from "@lib/constants"
import {
  topupWallet,
  fetchPaymentProviders,
  fetchWalletHistory,
  WalletHistoryEntry,
} from "@lib/data/wallet"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveCart } from "@lib/data/cart"
import { CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type WalletProps = {
  customer: HttpTypes.StoreCustomer | null
}

const Wallet = ({ customer: initialCustomer }: WalletProps) => {
  const [customer, setCustomer] = useState(initialCustomer)
  const [amount, setAmount] = useState<string>("")
  const [providers, setProviders] = useState<{ id: string }[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const loadProviders = async () => {
      const data = await fetchPaymentProviders()
      if (data?.payment_providers) {
        // Exclude wallet itself from top-up methods
        const available = data.payment_providers.filter(p => p.id !== "pp_wallet")
        setProviders(available)
        if (available.length > 0) {
          setSelectedProvider(available[0].id)
        }
      }
    }
    loadProviders()
  }, [])

  // Returning from a redirect-based top-up payment (?topup=success): the balance is
  // credited by the provider's webhook, which can lag slightly behind the browser
  // redirect, so poll a few times for the updated balance instead of a single fetch.
  const [confirmingTopup, setConfirmingTopup] = useState(
    searchParams.get("topup") === "success"
  )
  const [topupFailed, setTopupFailed] = useState(false)

  useEffect(() => {
    if (searchParams.get("topup") !== "success") {
      return
    }

    let cancelled = false
    const startingBalance = (initialCustomer as any)?.wallet_balance ?? 0
    const cartId = searchParams.get("cart") || undefined

    const poll = async (attempt: number) => {
      if (cancelled) {
        return
      }

      // Check the cart's own status first - if the provider already reported the
      // payment as cancelled/failed, stop immediately instead of polling forever.
      const currentCart = await retrieveCart(cartId, undefined, true).catch(() => null)
      if (cancelled) {
        return
      }
      if ((currentCart as any)?.payment_status === "payment_failed") {
        setConfirmingTopup(false)
        setTopupFailed(true)
        return
      }

      const fresh = await retrieveCustomer(true).catch(() => null)
      if (cancelled) {
        return
      }
      if (fresh && (fresh as any).wallet_balance !== startingBalance) {
        setCustomer(fresh)
        setConfirmingTopup(false)
        fetchWalletHistory(true).then((data) => setHistory(data.entries))
        return
      }
      if (attempt < 8) {
        setTimeout(() => poll(attempt + 1), 1500)
      } else {
        setConfirmingTopup(false)
      }
    }

    poll(0)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [history, setHistory] = useState<WalletHistoryEntry[]>([])

  useEffect(() => {
    fetchWalletHistory().then((data) => setHistory(data.entries))

    // The page's initial customer prop can come from a cached fetch (e.g. a previous
    // page visit revalidated it) - refresh once on mount so the balance shown is never
    // stale relative to spends/top-ups that happened since that cache entry was made.
    if (searchParams.get("topup") !== "success") {
      retrieveCustomer(true).then((fresh) => fresh && setCustomer(fresh))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const value = parseFloat(amount)
    if (isNaN(value) || value < 1) {
      setError("Please enter a valid amount of at least €1.00")
      return
    }

    if (!selectedProvider) {
      setError("Please select a payment method")
      return
    }

    setIsLoading(true)
    try {
      const amountInCents = Math.round(value * 100)
      const data = await topupWallet(amountInCents, selectedProvider)
      
      if (data?.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError("Unable to start payment.")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
      setIsLoading(false)
    }
  }

  // Ensure these properties exist on the object, though types might not reflect it yet.
  const walletBalance = (customer as any)?.wallet_balance || 0
  const loyaltyPoints = (customer as any)?.loyalty_points || 0

  return (
    <div className="w-full" data-testid="wallet-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h1" className="text-2xl-semi">
          Wallet & Loyalty
        </Heading>
        <Text className="text-base-regular">
          View your balances and top up your Retaildesk wallet.
        </Text>
      </div>

      {searchParams.get("topup") === "success" && (
        <Container
          className={clx("p-4 mb-6 border rounded-lg", {
            "bg-gray-50 border-gray-200": !topupFailed,
            "bg-red-50 border-red-200": topupFailed,
          })}
        >
          <Text className={clx({ "text-red-700": topupFailed })}>
            {topupFailed
              ? "Payment was cancelled or failed. Your wallet was not topped up."
              : confirmingTopup
              ? "Payment received - confirming your new balance..."
              : "Your wallet has been topped up."}
          </Text>
        </Container>
      )}

      <div className="flex flex-col gap-y-8 w-full">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
          <Container className="p-6 bg-gray-50 flex flex-col gap-y-2 justify-center items-center rounded-lg shadow-sm border border-gray-200">
            <Text className="text-ui-fg-subtle text-sm font-semibold uppercase tracking-wider">Wallet Balance</Text>
            <Text className="text-3xl font-bold text-ui-fg-base">
              {convertToLocale({
                amount: walletBalance,
                currency_code: "eur",
              })}
            </Text>
          </Container>
          
          <Container className="p-6 bg-gray-50 flex flex-col gap-y-2 justify-center items-center rounded-lg shadow-sm border border-gray-200">
            <Text className="text-ui-fg-subtle text-sm font-semibold uppercase tracking-wider">Loyalty Points</Text>
            <Text className="text-3xl font-bold text-ui-fg-base">
              {loyaltyPoints}
            </Text>
          </Container>
        </div>

        <div className="flex flex-col gap-y-4 mt-4">
          <Heading level="h2" className="text-xl-semi">
            Top Up Wallet
          </Heading>
          
          <form onSubmit={handleTopup} className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2 max-w-sm">
              <Text className="txt-medium-plus text-ui-fg-base">Amount (€)</Text>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            {providers.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <Text className="txt-medium-plus text-ui-fg-base">Select Payment Method</Text>
                <RadioGroup
                  value={selectedProvider}
                  onChange={setSelectedProvider}
                  className="grid grid-cols-1 small:grid-cols-2 gap-4"
                >
                  {providers.map((provider) => {
                    const info = paymentInfoMap[provider.id]
                    return (
                      <RadioGroup.Option
                        key={provider.id}
                        value={provider.id}
                        className={({ checked }) =>
                          clx(
                            "flex items-center gap-x-4 p-4 border rounded-lg cursor-pointer transition-colors",
                            {
                              "border-gray-900 ring-2 ring-gray-900 bg-gray-50": checked,
                              "border-gray-200 hover:bg-gray-50": !checked,
                            }
                          )
                        }
                      >
                        {({ checked }) => (
                          <>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200">
                              {info?.icon || <CreditCard />}
                            </div>
                            <span className="text-base-regular font-medium">
                              {info?.title || provider.id}
                            </span>
                            <div
                              className={clx(
                                "ml-auto w-4 h-4 rounded-full border",
                                {
                                  "border-4 border-gray-900": checked,
                                  "border-gray-300": !checked,
                                }
                              )}
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    )
                  })}
                </RadioGroup>
              </div>
            )}
            
            <ErrorMessage error={error} />
            
            <Button
              type="submit"
              className="max-w-sm w-full mt-2"
              size="large"
              isLoading={isLoading}
              disabled={isLoading || !amount || !selectedProvider}
            >
              Pay securely
            </Button>
          </form>
        </div>

        <div className="flex flex-col gap-y-4">
          <Heading level="h2" className="text-xl-semi">
            Wallet History
          </Heading>

          {history.length === 0 ? (
            <Text className="text-ui-fg-subtle">No wallet activity yet.</Text>
          ) : (
            <div className="flex flex-col">
              {history.map((entry) => {
                const row = (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 w-full">
                    <div className="flex flex-col">
                      <Text
                        className={clx("txt-medium-plus", {
                          "text-ui-fg-interactive": !!entry.order_id,
                        })}
                      >
                        {entry.label}
                      </Text>
                      <Text className="txt-small text-ui-fg-subtle">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                    <Text
                      className={clx("txt-medium-plus", {
                        "text-emerald-600": entry.amount > 0,
                        "text-ui-fg-base": entry.amount <= 0,
                      })}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {convertToLocale({ amount: entry.amount, currency_code: "eur" })}
                    </Text>
                  </div>
                )

                return entry.order_id ? (
                  <LocalizedClientLink
                    key={entry.id}
                    href={`/account/orders/details/${entry.order_id}`}
                  >
                    {row}
                  </LocalizedClientLink>
                ) : (
                  <div key={entry.id}>{row}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Wallet
