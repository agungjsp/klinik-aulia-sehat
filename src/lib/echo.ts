import Echo from "laravel-echo"
import Pusher from "pusher-js"

// Make Pusher available globally for Echo
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<"reverb">
  }
}

window.Pusher = Pusher

// Environment variables for Reverb configuration
const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || ""
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || "localhost"
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT || "8080"
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME || "http"

// Only initialize Echo if the app key is configured
let echo: Echo<"reverb"> | null = null

export function getEcho(): Echo<"reverb"> | null {
  if (!REVERB_APP_KEY) {
    console.warn("Laravel Reverb is not configured. Set VITE_REVERB_APP_KEY to enable realtime updates.")
    return null
  }

  if (!echo) {
    echo = new Echo({
      broadcaster: "reverb",
      key: REVERB_APP_KEY,
      wsHost: REVERB_HOST,
      wsPort: Number(REVERB_PORT),
      wssPort: Number(REVERB_PORT),
      forceTLS: REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
    })
  }

  return echo
}

export function disconnectEcho(): void {
  if (echo) {
    echo.disconnect()
    echo = null
  }
}
