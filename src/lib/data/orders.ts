"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
      },
      headers,
      next,
      cache: "no-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "no-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const createReturn = async (
  orderId: string,
  items: { line_item_id: number; quantity: number }[],
  reason?: string
) => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }
    const response = await sdk.client.fetch(`/store/orders/${orderId}/returns`, {
      method: "POST",
      headers,
      body: {
        items,
        reason,
      },
    })
    
    revalidateTag("orders")
    
    return { success: true, data: response }
  } catch (error: any) {
    console.error("Failed to create return:", error)
    return { success: false, error: error.message || "Failed to create return" }
  }
}

export const listReturns = async () => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("returns")),
    }

    const response = await sdk.client.fetch(`/store/returns`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })

    return response.returns
  } catch (error: any) {
    console.error("Failed to list returns:", error)
    return []
  }
}

export const retrieveReturn = async (id: string) => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("returns")),
    }

    const response = await sdk.client.fetch(`/store/returns/${id}`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })

    return response.return
  } catch (error: any) {
    console.error("Failed to retrieve return:", error)
    return null
  }
}

export const retrieveGuestOrder = async (displayId: string, email: string) => {
  try {
    const next = {
      ...(await getCacheOptions("orders")),
    }

    const response = await sdk.client.fetch(`/store/guest-orders/${displayId}?email=${encodeURIComponent(email)}`, {
      method: "GET",
      next,
      cache: "no-cache",
    })

    return response.order
  } catch (error: any) {
    console.error("Failed to retrieve guest order:", error)
    return null
  }
}

export const createGuestReturn = async (displayId: string, email: string, returnItems: Record<string, number>, reason?: string) => {
  try {
    const itemsPayload = Object.entries(returnItems).map(([id, qty]) => ({
      line_item_id: Number(id),
      quantity: qty
    }))

    const response = await sdk.client.fetch(`/store/guest-orders/${displayId}/returns`, {
      method: "POST",
      body: {
        email,
        items: itemsPayload,
        reason
      }
    })

    return { success: true, data: response }
  } catch (error: any) {
    console.error("Failed to create guest return:", error)
    return { success: false, error: error.message || "Failed to create return" }
  }
}
