import { HttpTypes } from "@medusajs/types"
import { Text, Badge } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getFulfillmentColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
      case "pickup_finished":
      case "fulfilled":
        return "green"
      case "processing":
      case "shipped":
      case "pickup_available":
        return "blue"
      case "cancelled":
      case "canceled":
        return "red"
      default:
        return "grey"
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "captured":
        return "green"
      case "refunded":
      case "canceled":
        return "red"
      default:
        return "grey"
    }
  }

  return (
    <div>
      <Text>
        We have sent the order confirmation details to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-6 mt-6 pb-6 border-b border-gray-200">
        {showStatus && (
          <>
            <div className="flex items-center gap-x-2">
              <Text className="text-ui-fg-subtle">Order status:</Text>
              <Badge color={getFulfillmentColor(order.fulfillment_status)} data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </Badge>
            </div>
            <div className="flex items-center gap-x-2">
              <Text className="text-ui-fg-subtle">Payment status:</Text>
              <Badge color={getPaymentColor(order.payment_status)} data-testid="order-payment-status">
                {formatStatus(order.payment_status)}
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
