export default function medusaError(error: any): never {
  // Preserve the HTTP status (set by the Medusa SDK's FetchError) on the thrown Error so
  // callers can branch on it (e.g. 409 "not confirmed yet, keep polling" vs 422 "failed,
  // stop polling") without parsing the message string.
  const attachStatus = (err: Error) => {
    if (typeof error?.status === "number") {
      ;(err as any).status = error.status
    }
    return err
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message = error.response.data.message || error.response.data

    throw attachStatus(
      new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
    )
  } else if (error.request) {
    // The request was made but no response was received
    throw attachStatus(new Error("No response received: " + error.request))
  } else {
    // Something happened in setting up the request that triggered an Error
    throw attachStatus(new Error("Error setting up the request: " + error.message))
  }
}
