"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type ReturnsOverviewProps = {
  returns: any[]
}

const ReturnsOverview = ({ returns }: ReturnsOverviewProps) => {
  if (returns?.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center gap-y-4"
        data-testid="no-returns-container"
      >
        <h2 className="text-large-semi">Nothing to see here</h2>
        <p className="text-base-regular">
          You don't have any returns yet.
        </p>
        <div className="mt-4">
          <LocalizedClientLink href="/" passHref>
            <Button data-testid="continue-shopping-button">
              Continue shopping
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="flex flex-col gap-y-8 w-full">
      {returns.map((ret) => (
        <div
          key={ret.id}
          className="border-b border-gray-200 pb-6 last:pb-0 last:border-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="grid grid-cols-3 grid-rows-2 text-small-regular gap-x-4 flex-1">
              <span className="font-semibold">Date placed</span>
              <span className="font-semibold">Return number</span>
              <span className="font-semibold">Status</span>
              <span data-testid="return-created-date">
                {new Date(ret.created_at).toDateString()}
              </span>
              <LocalizedClientLink 
                href={`/account/returns/details/${ret.id}`}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="return-id"
              >
                #{ret.id}
              </LocalizedClientLink>
              <span>{formatStatus(ret.status)}</span>
            </div>
            <div className="flex items-center gap-x-4">
              <LocalizedClientLink href={`/account/returns/details/${ret.id}`}>
                <Button variant="secondary" data-testid="view-return-button">
                  View details
                </Button>
              </LocalizedClientLink>
            </div>
          </div>
          <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
            {ret.items?.slice(0, 3).map((i: any) => {
              return (
                <div
                  key={i.id}
                  className="flex flex-col gap-y-2"
                  data-testid="return-item"
                >
                  <Thumbnail thumbnail={i.thumbnail} images={[]} size="square" />
                  <div className="flex items-center text-small-regular text-ui-fg-base">
                    <span
                      className="text-ui-fg-base font-semibold"
                      data-testid="item-title"
                    >
                      {i.title}
                    </span>
                    <span className="ml-2">x</span>
                    <span data-testid="item-quantity">{i.quantity}</span>
                  </div>
                </div>
              )
            })}
            {ret.items?.length > 4 && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-small-regular text-ui-fg-base">
                  + {ret.items.length - 4}
                </span>
                <span className="text-small-regular text-ui-fg-base">more</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReturnsOverview
