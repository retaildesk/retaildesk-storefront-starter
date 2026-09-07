"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import ReturnModal from "@modules/order/components/return-modal"

type StoreOrderWithReturns = HttpTypes.StoreOrder & {
  returns?: Array<{
    id: string
    status: string
    items: Array<{ item_id: string; quantity: number }>
    created_at: string
  }>
}

type OrderDetailsTemplateProps = {
  order: StoreOrderWithReturns
  guestEmail?: string
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  guestEmail,
}) => {
  const hasReturns = order.returns && order.returns.length > 0

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <div className="flex items-center gap-x-4">
          <h1 className="text-2xl-semi">Order details</h1>
          {order.payment_collections?.[0]?.payments?.[0]?.amount > 0 && <ReturnModal order={order} guestEmail={guestEmail} />}
        </div>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        
        {hasReturns && (
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h2 className="text-large-semi mb-2">Returns</h2>
            <div className="flex flex-col gap-y-2">
              {order.returns?.map((ret) => (
                <div key={ret.id} className="flex justify-between text-base-regular">
                  <Text>Return #{ret.id}</Text>
                  <Text className="capitalize text-ui-fg-subtle">{ret.status}</Text>
                </div>
              ))}
            </div>
          </div>
        )}

        <Items order={order} />
        <ShippingDetails order={order} />
        <PaymentDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
