"use client"

import { XMark, DocumentText } from "@medusajs/icons"
import { Badge, Text, Button, Table, Container } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import LineItemPrice from "@modules/common/components/line-item-price"

type ReturnDetailsTemplateProps = {
  returnData: any
}

const ReturnDetailsTemplate = ({ returnData }: ReturnDetailsTemplateProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange"
      case "received":
      case "approved":
        return "green"
      case "rejected":
      case "canceled":
        return "red"
      default:
        return "grey"
    }
  }

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Return details</h1>
        <LocalizedClientLink
          href="/account/returns"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-returns-button"
        >
          <XMark /> Back to returns
        </LocalizedClientLink>
      </div>

      <div className="flex flex-col gap-4 h-full bg-white w-full">
        <div className="flex items-center text-compact-small gap-x-6 pb-6 border-b border-gray-200 mt-2">
          <div className="flex items-center gap-x-2">
            <Text className="text-ui-fg-subtle">Return status:</Text>
            <Badge color={getStatusColor(returnData.status)}>
              {formatStatus(returnData.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-x-2">
            <Text className="text-ui-fg-subtle">Return ID:</Text>
            <Text className="text-ui-fg-interactive">#{returnData.id}</Text>
          </div>
          <div className="flex items-center gap-x-2">
            <Text className="text-ui-fg-subtle">Original Order:</Text>
            <LocalizedClientLink href={`/account/orders/details/${returnData.order_id}`}>
              <Text className="text-ui-fg-interactive underline">#{returnData.order_id}</Text>
            </LocalizedClientLink>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 mt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-large-semi">Items to Return</h2>
            <Button variant="secondary" disabled className="gap-x-2">
              <DocumentText />
              Download Return Label
            </Button>
          </div>

          <Table>
            <Table.Body>
              {returnData.items?.map((item: any) => (
                <Table.Row key={item.id} className="w-full">
                  <Table.Cell className="!pl-0 p-4 w-24">
                    <div className="flex w-16">
                      <Thumbnail thumbnail={item.thumbnail} size="square" />
                    </div>
                  </Table.Cell>

                  <Table.Cell className="text-left">
                    <Text className="txt-medium-plus text-ui-fg-base">
                      {item.title}
                    </Text>
                  </Table.Cell>

                  <Table.Cell className="!pr-0">
                    <span className="flex flex-col items-end h-full justify-center">
                      <span className="flex gap-x-1 ">
                        <Text className="text-ui-fg-muted">
                          <span data-testid="product-quantity">{item.quantity}</span>x{" "}
                        </Text>
                        <Text className="text-ui-fg-muted">
                          €{item.unit_price.toFixed(2)}
                        </Text>
                      </span>
                      <Text className="text-ui-fg-base">
                        €{item.total.toFixed(2)}
                      </Text>
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {returnData.notes && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
            <Text className="font-semibold mb-2">Return Reason / Notes</Text>
            <Text className="text-ui-fg-subtle">{returnData.notes}</Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnDetailsTemplate
