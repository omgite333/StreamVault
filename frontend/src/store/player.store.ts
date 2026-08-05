import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerSettingsState {
  volume: number
  muted: boolean
  speed: number
  autoplayNext: boolean
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setSpeed: (speed: number) => void
  setAutoplayNext: (autoplayNext: boolean) => void
}

export const usePlayerStore = create<PlayerSettingsState>()(
  persist(
    (set) => ({
      volume: 1,
      muted: false,
      speed: 1,
      autoplayNext: true,
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setSpeed: (speed) => set({ speed }),
      setAutoplayNext: (autoplayNext) => set({ autoplayNext }),
    }),
    {
      name: 'streamvault-player-settings',
    },
  ),
)
