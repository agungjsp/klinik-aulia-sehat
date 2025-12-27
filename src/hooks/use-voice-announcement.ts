import { useCallback, useState } from "react"

const CHIME_URL = "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"

const DIGIT_WORDS = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]

function numberToWords(n: number): string[] {
  if (n === 0) return ["nol"]
  if (n < 0) return ["minus", ...numberToWords(-n)]

  const words: string[] = []

  if (n >= 1000) {
    const ribu = Math.floor(n / 1000)
    if (ribu === 1) words.push("seribu")
    else words.push(...numberToWords(ribu), "ribu")
    n %= 1000
  }

  if (n >= 100) {
    const ratus = Math.floor(n / 100)
    if (ratus === 1) words.push("seratus")
    else words.push(DIGIT_WORDS[ratus], "ratus")
    n %= 100
  }

  if (n >= 20) {
    words.push(DIGIT_WORDS[Math.floor(n / 10)], "puluh")
    if (n % 10 !== 0) words.push(DIGIT_WORDS[n % 10])
  } else if (n >= 12) {
    words.push(DIGIT_WORDS[n - 10], "belas")
  } else if (n === 11) {
    words.push("sebelas")
  } else if (n === 10) {
    words.push("sepuluh")
  } else if (n > 0) {
    words.push(DIGIT_WORDS[n])
  }

  return words
}

function parseQueueNumber(queue: string): string[] {
  const match = queue.match(/^([A-Z])?(\d+)$/i)
  if (!match) return [queue]

  const [, letter, num] = match
  const words: string[] = []

  if (letter) words.push(letter.toUpperCase())
  words.push(...numberToWords(parseInt(num, 10)))

  return words
}

export function useVoiceAnnouncement() {
  const [isPlaying, setIsPlaying] = useState(false)

  const playChime = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(CHIME_URL)
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play().catch(() => resolve())
    })
  }, [])

  const speakWord = useCallback((word: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) return resolve()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "id-ID"
      utterance.rate = 0.9
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const speakSequence = useCallback(async (words: string[]) => {
    for (const word of words) {
      await speakWord(word)
      await new Promise((r) => setTimeout(r, 100))
    }
  }, [speakWord])

  const announce = useCallback(async (queueNumber: string, room?: string) => {
    if (isPlaying) return
    setIsPlaying(true)
    try {
      await playChime()
      await speakSequence(["nomor", "antrian"])
      await speakSequence(parseQueueNumber(queueNumber))
      if (room) {
        await speakSequence(["silahkan", "ke", "ruang"])
        await speakSequence(room.split(/\s+/))
      }
    } finally {
      setIsPlaying(false)
    }
  }, [isPlaying, playChime, speakSequence])

  return { announce, isPlaying }
}
