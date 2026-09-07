"use client"

import React, { useState } from "react"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"
import { createReturn, createGuestReturn } from "@lib/data/orders"
import { ArrowUturnLeft } from "@medusajs/icons"

type StoreOrderWithReturns = HttpTypes.StoreOrder & {
  returns?: Array<{
    id: string
    status: string
    items: Array<{ item_id: string; quantity: number }>
    created_at: string
  }>
}

type ReturnModalProps = {
  order: StoreOrderWithReturns
  guestEmail?: string
}

const ReturnModal: React.FC<ReturnModalProps> = ({ order, guestEmail }) => {
  const { state, open, close: closeModal } = useToggleState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [returnItems, setReturnItems] = useState<Record<string, number>>({})
  const [reason, setReason] = useState("")

  const handleToggleItem = (itemId: string, maxQuantity: number) => {
    setReturnItems((prev) => {
      const next = { ...prev }
      if (next[itemId]) {
        delete next[itemId]
      } else {
        next[itemId] = maxQuantity
      }
      return next
    })
  }

  const handleQuantityChange = (itemId: string, quantity: number, maxQuantity: number) => {
    if (quantity < 1 || quantity > maxQuantity) return
    setReturnItems((prev) => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  const close = () => {
    setReturnItems({})
    setReason("")
    setError(null)
    setSuccess(false)
    closeModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const itemsPayload = Object.entries(returnItems).map(([id, qty]) => ({
      line_item_id: Number(id),
      quantity: qty
    }))

    if (itemsPayload.length === 0) {
      setError("Please select at least one item to return.")
      return
    }

    setLoading(true)
    let res
    if (guestEmail) {
      res = await createGuestReturn(order.display_id.toString(), guestEmail, returnItems, reason)
    } else {
      res = await createReturn(order.id, itemsPayload, reason)
    }
    setLoading(false)

    if (res.success) {
      setSuccess(true)
      // Optionally we could reload the page or update state here.
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setError(res.error || "Failed to create return")
    }
  }

  // Only show return button if order is fulfilled or similar. 
  // For simplicity, we just check if it has items.
  if (!order.items || order.items.length === 0) return null

  return (
    <>
      <Button
        variant="secondary"
        className="flex items-center gap-x-2"
        onClick={open}
      >
        <ArrowUturnLeft />
        Return Items
      </Button>

      <Modal isOpen={state} close={close} data-testid="return-order-modal">
        <Modal.Title>
          <Heading className="mb-2">Request a Return</Heading>
        </Modal.Title>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {success ? (
              <div className="py-8 text-center text-green-600">
                <Heading className="mb-2">Return Requested Successfully!</Heading>
                <Text>Your return request has been submitted.</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-6">
                <div>
                  <Text className="mb-4 text-ui-fg-subtle">
                    Select the items you wish to return and specify the quantity.
                  </Text>
                  <div className="flex flex-col gap-y-4">
                    {order.items.map((item) => {
                      const returnedQuantity = order.returns?.reduce((acc, ret) => {
                        const retItem = ret.items.find(ri => ri.item_id === item.id)
                        return acc + (retItem ? retItem.quantity : 0)
                      }, 0) || 0
                      
                      const availableQuantity = item.quantity - returnedQuantity
                      const isSelected = !!returnItems[item.id]
                      const quantity = returnItems[item.id] || availableQuantity
                      const isFullyReturned = availableQuantity <= 0
                      
                      return (
                        <div key={item.id} className={clx("flex items-center justify-between p-4 border rounded-lg", { "opacity-50": isFullyReturned })}>
                          <div className="flex items-center gap-x-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isFullyReturned}
                              onChange={() => handleToggleItem(item.id, availableQuantity)}
                              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 disabled:opacity-50"
                            />
                            <div className="flex items-center gap-x-4">
                              <div className="w-12 h-12 flex-shrink-0">
                                <Thumbnail thumbnail={item.thumbnail} size="square" />
                              </div>
                              <div>
                                <Text className="font-semibold">{item.product_title}</Text>
                                <Text className="text-ui-fg-subtle text-small-regular">
                                  Purchased: {item.quantity} {returnedQuantity > 0 ? `(Returned: ${returnedQuantity})` : ''}
                                </Text>
                              </div>
                            </div>
                          </div>
                          
                          {isSelected && !isFullyReturned && (
                            <div className="flex items-center gap-x-2">
                              <Text className="text-small-regular">Qty:</Text>
                              <input
                                type="number"
                                min="1"
                                max={availableQuantity}
                                value={quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value), availableQuantity)}
                                className="w-16 p-1 border rounded text-center"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <Text className="mb-2 font-semibold">Reason for Return (Optional)</Text>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                    rows={3}
                    placeholder="Tell us why you are returning these items..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-rose-500 text-small-regular mt-4">
                {error}
              </div>
            )}
          </Modal.Body>
          
          {!success && (
            <Modal.Footer>
              <div className="flex gap-3 mt-6">
                <Button
                  type="reset"
                  variant="secondary"
                  onClick={close}
                  className="h-10"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-10" 
                  isLoading={loading}
                >
                  Submit Return
                </Button>
              </div>
            </Modal.Footer>
          )}
        </form>
      </Modal>
    </>
  )
}

export default ReturnModal
