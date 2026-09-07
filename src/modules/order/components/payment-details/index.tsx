import { Container, Heading, Text } from "@medusajs/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  // Wallet balance + coupon can cover part of an order with the rest charged to a real
  // provider - show every payment that actually contributed, not just the first.
  const payments = order.payment_collections?.[0]?.payments ?? []

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Payment
      </Heading>
      <div className="flex flex-col gap-y-4">
        {payments.map((payment: any, index: number) => {
          const info = paymentInfoMap[payment.provider_id]

          return (
            <div key={index} className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method"
                >
                  {info?.title ?? payment.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-2/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {info?.icon ?? null}
                  </Container>
                  <Text data-testid="payment-amount">
                    {isStripeLike(payment.provider_id) && payment.data?.card_last4
                      ? `**** **** **** ${payment.data.card_last4}`
                      : `${convertToLocale({
                          amount: payment.amount,
                          currency_code: order.currency_code,
                        })} paid at ${new Date(
                          payment.created_at ?? ""
                        ).toLocaleString()}`}
                  </Text>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
