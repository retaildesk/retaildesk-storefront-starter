import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveReturn } from "@lib/data/orders"
import ReturnDetailsTemplate from "@modules/account/components/return-details-template"

export const metadata: Metadata = {
  title: "Return Details",
  description: "View the details of your return.",
}

export default async function ReturnDetails({
  params,
}: {
  params: { id: string }
}) {
  const returnData = await retrieveReturn(params.id)

  if (!returnData) {
    notFound()
  }

  return <ReturnDetailsTemplate returnData={returnData} />
}
