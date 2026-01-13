import { AxiosError } from "axios"

export const DEFAULT_ERROR_MESSAGE = "Terjadi kesalahan. Silakan coba lagi."

/**
 * Extracts error message from API errors.
 * Prioritizes backend-provided message, falls back to default message.
 *
 * @param error - The error object (typically from catch blocks)
 * @returns Error message string
 */
export function getApiErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data

    // If response.data is a string, use it directly
    if (typeof data === "string") {
      return data
    }

    // If response.data has a message property (string), use it
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message
    }
  }

  // For non-Axios errors or errors without a message, return default
  return DEFAULT_ERROR_MESSAGE
}
