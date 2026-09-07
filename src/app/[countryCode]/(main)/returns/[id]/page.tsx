import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveGuestOrder } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your order details and initiate a return.",
}

export default async function GuestOrderDetails({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { email?: string }
}) {
  const { id } = params
  const email = searchParams.email

  if (!email) {
    notFound()
  }

  const order = await retrieveGuestOrder(id, email)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex justify-center min-h-[50vh] py-12 bg-gray-50">
      <div className="max-w-4xl w-full px-4">
        <OrderDetailsTemplate order={order} guestEmail={email} />
      </div>
    </div>
  )
}
