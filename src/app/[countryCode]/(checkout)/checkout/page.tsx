import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type Props = {
  searchParams: Promise<{ cart?: string }>
}

export default async function Checkout({ searchParams }: Props) {
  // Redirect-based payment providers (OPP/Mollie) append ?cart=<id> to the return_url as
  // a fallback identifier - the browser's own cart cookie can be lost across the redirect
  // (SameSite, or switching origins), so fall back to it instead of 404ing.
  const { cart: cartIdParam } = await searchParams
  const cart = await retrieveCart(cartIdParam)

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
