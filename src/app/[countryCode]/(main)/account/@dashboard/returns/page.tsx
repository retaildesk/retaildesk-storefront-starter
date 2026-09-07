import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listReturns } from "@lib/data/orders"
import ReturnsOverview from "@modules/account/components/returns-overview"

export const metadata: Metadata = {
  title: "Returns",
  description: "Overview of your previous returns.",
}

export default async function Returns() {
  const returns = await listReturns()

  if (!returns) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="returns-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Returns</h1>
        <p className="text-base-regular">
          View your previous returns and their status.
        </p>
      </div>
      <div>
        <ReturnsOverview returns={returns} />
      </div>
    </div>
  )
}
