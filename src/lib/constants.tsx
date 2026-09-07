import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

// Map of payment provider_id to its title and icon. A provider still works without an
// entry here (PaymentContainer falls back to the raw id, no icon) - this is only for
// display. The set of pp_opp_redirect_* ids actually offered per webshop is controlled
// server-side in StorefrontPaymentController::STOREFRONT_METHODS - add a new method there
// first, then add its label/icon here to match.
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_opp_redirect_ideal: {
    title: "iDEAL",
    icon: <Ideal />,
  },
  pp_opp_redirect_bcmc: {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_opp_redirect_creditcard: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  pp_wallet: {
    title: "Retaildesk Wallet",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// RetailDesk's redirect-based hosted checkout (OPP/Mollie) - "Place order" sends the
// customer to session.data.checkout_url instead of confirming a card or auto-completing.
export const isRedirectPayment = (providerId?: string) => {
  return providerId?.startsWith("pp_opp_redirect")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
