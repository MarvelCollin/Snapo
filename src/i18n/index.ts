import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { en, type Dict } from './en'
import { id } from './id'

export type Lang = 'en' | 'id'

export const languages: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'id', label: 'Bahasa Indonesia', short: 'ID' },
]

const dicts: Record<Lang, Dict> = { en, id }

const detect = (): Lang => {
  try {
    return navigator.languages?.some((l) => l.toLowerCase().startsWith('id')) ? 'id' : 'en'
  } catch {
    return 'en'
  }
}

export const useLang = create<{ lang: Lang; setLang: (lang: Lang) => void }>()(
  persist((set) => ({ lang: detect(), setLang: (lang) => set({ lang }) }), {
    name: 'snapo-lang',
    storage: createJSONStorage(() => localStorage),
  }),
)

export const useT = () => dicts[useLang((s) => s.lang)]

export const getT = () => dicts[useLang.getState().lang]

export const getLocale = () => (useLang.getState().lang === 'id' ? 'id-ID' : 'en')

export type { Dict }
