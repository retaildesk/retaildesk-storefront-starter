"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession, placeOrder, retrieveCart } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Checkbox, Container, Heading, Input, Label, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  customer,
  availablePaymentMethods,
}: {
  cart: any
  customer?: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  // Wallet balance (rfid_balance) can cover part or all of the order, combined with a
  // real provider for whatever's left - same as combining a gift card with a card payment
  // in the physical shop.
  const walletBalance: number = customer?.wallet_balance ?? 0
  const cartTotal: number = cart?.total ?? 0
  const maxWalletUsable = Math.min(walletBalance, cartTotal)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmount, setWalletAmount] = useState<string>("")
  const walletAmountValue = useWallet ? parseFloat(walletAmount || "0") || 0 : 0
  const walletCoversFull = useWallet && walletAmountValue >= cartTotal && cartTotal > 0

  const toggleWallet = (checked: boolean) => {
    setUseWallet(checked)
    setWalletAmount(checked ? maxWalletUsable.toFixed(2) : "")
  }

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  // Redirect-based providers (OPP/Mollie) send the customer back here with ?cart=...
  // once they've paid on the provider's own hosted page. The order itself is created
  // by the provider's webhook, which can lag slightly behind the browser redirect, so
  // poll cart-complete for a few seconds rather than a single attempt.
  const returningFromRedirect = isOpen && !!searchParams.get("cart")
  const [confirming, setConfirming] = useState(returningFromRedirect)

  useEffect(() => {
    if (!returningFromRedirect) {
      return
    }

    let cancelled = false

    const cartId = searchParams.get("cart") || undefined

    const attemptCompletion = async (attempt: number) => {
      if (cancelled) {
        return
      }

      // Check the cart's own status first - if the provider already reported the payment
      // as cancelled/failed, stop immediately instead of polling out the full retry budget.
      const currentCart = await retrieveCart(cartId, undefined, true).catch(() => null)
      if (cancelled) {
        return
      }
      if ((currentCart as any)?.payment_status === "payment_failed") {
        setConfirming(false)
        setError("Payment was cancelled or failed. Please try again.")
        return
      }

      try {
        await placeOrder()
      } catch (err: any) {
        if (cancelled) {
          return
        }

        if (attempt < 8) {
          setTimeout(() => attemptCompletion(attempt + 1), 1500)
        } else {
          setConfirming(false)
          setError(
            "Your payment was received and is being confirmed. Please refresh this page in a moment."
          )
        }
      }
    }

    attemptCompletion(0)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returningFromRedirect])

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const providerId =
        selectedPaymentMethod || (walletCoversFull ? "pp_wallet" : "")

      const shouldInputCard = isStripeLike(providerId) && !activeSession

      const checkActiveSession =
        !useWallet && activeSession?.provider_id === providerId

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: providerId,
          ...(useWallet ? { wallet_amount: walletAmountValue } : {}),
        } as any)
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {confirming && (
            <Text className="mb-6">Confirming your payment...</Text>
          )}
          {!confirming && !paidByGiftcard && walletBalance > 0 && (
            <div className="flex flex-col gap-y-2 mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-x-2">
                <Checkbox
                  id="use-wallet"
                  checked={useWallet}
                  onCheckedChange={(checked) => toggleWallet(!!checked)}
                />
                <Label htmlFor="use-wallet" className="txt-medium-plus">
                  Use my wallet balance (
                  {convertToLocale({
                    amount: walletBalance,
                    currency_code: cart?.currency_code ?? "eur",
                  })}{" "}
                  available)
                </Label>
              </div>

              {useWallet && (
                <div className="flex items-center gap-x-2 max-w-[200px]">
                  <Input
                    type="number"
                    min={0}
                    max={maxWalletUsable}
                    step="0.01"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                  />
                </div>
              )}

              {walletCoversFull && (
                <Text className="text-ui-fg-subtle txt-small">
                  Your wallet balance fully covers this order - no additional
                  payment needed.
                </Text>
              )}
            </div>
          )}

          {!confirming && !paidByGiftcard && !walletCoversFull && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods
                  .filter((paymentMethod) => paymentMethod.id !== "pp_wallet")
                  .map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {!confirming && (
          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod &&
                !paidByGiftcard &&
                !walletCoversFull) ||
              (useWallet && walletAmountValue > maxWalletUsable)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? " Enter card details"
              : "Continue to review"}
          </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeLike(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
