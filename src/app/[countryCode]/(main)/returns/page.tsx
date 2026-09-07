"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Button, Heading, Text, Container } from "@medusajs/ui"

export default function GuestReturnsPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber || !email) return

    router.push(`/returns/${orderNumber}?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 bg-gray-50">
      <Container className="max-w-md w-full p-8 flex flex-col gap-y-6">
        <div className="text-center flex flex-col gap-y-2">
          <Heading className="text-2xl-semi">Guest Returns</Heading>
          <Text className="text-ui-fg-subtle">
            Enter your order details to view your order and initiate a return.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Text className="text-small-semi">Order Number</Text>
            <Input
              placeholder="e.g. F-16"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Text className="text-small-semi">Email Address</Text>
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4" size="large">
            Look up Order
          </Button>
        </form>
      </Container>
    </div>
  )
}
