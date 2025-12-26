import { useCallback, useState } from "react"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

const CHIME_URL = "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"

export function useVoiceAnnouncement() {
  const [isPlaying, setIsPlaying] = useState(false)

  const playChime = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(CHIME_URL)
      audio.onended = () => resolve()
      audio.onerror = () => {
        console.error("Failed to play chime")
        resolve()
      }
      audio.play().catch((err) => {
        console.warn("Audio playback failed (autoplay policy?):", err)
        resolve()
      })
    })
  }, [])

  const speakWithElevenLabs = useCallback(async (text: string) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID

    if (!apiKey || !voiceId) {
      throw new Error("Missing ElevenLabs configuration")
    }

    const client = new ElevenLabsClient({ apiKey })
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      } as any)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = new Response(audioStream as any)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      
      return new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onerror = () => resolve()
        audio.play()
      })

    } catch (error) {
      console.error("ElevenLabs error:", error)
      throw error
    }
  }, [])

  const speakWithBrowser = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "id-ID"
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const announce = useCallback(async (text: string) => {
    if (isPlaying) return
    setIsPlaying(true)

    try {
      await playChime()
      
      try {
        await speakWithElevenLabs(text)
      } catch (err) {
        console.warn("Falling back to browser TTS", err)
        await speakWithBrowser(text)
      }
    } catch (error) {
      console.error("Announcement failed", error)
    } finally {
      setIsPlaying(false)
    }
  }, [isPlaying, playChime, speakWithElevenLabs, speakWithBrowser])

  return {
    announce,
    isPlaying
  }
}
