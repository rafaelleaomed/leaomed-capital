'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PrivacyContextType {
  isPrivate: boolean
  togglePrivacy: () => void
  setPrivacy: (value: boolean) => void
  maskValue: (val: number | string | undefined | null, prefix?: string) => string
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
  setPrivacy: () => {},
  maskValue: () => ''
})

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('leaomed_privacy_mode')
      if (saved !== null) {
        setIsPrivate(saved === 'true')
      }
    } catch (_) {}

    const handleToggle = (e: any) => {
      if (e.detail?.isPrivate !== undefined) {
        setIsPrivate(e.detail.isPrivate)
      } else {
        setIsPrivate(prev => {
          const next = !prev
          try { localStorage.setItem('leaomed_privacy_mode', String(next)) } catch (_) {}
          return next
        })
      }
    }

    window.addEventListener('leaomed_toggle_privacy', handleToggle)
    return () => window.removeEventListener('leaomed_toggle_privacy', handleToggle)
  }, [])

  const setPrivacy = (val: boolean) => {
    setIsPrivate(val)
    try {
      localStorage.setItem('leaomed_privacy_mode', String(val))
    } catch (_) {}
  }

  const togglePrivacy = () => {
    setPrivacy(!isPrivate)
  }

  const maskValue = (val: number | string | undefined | null, prefix = 'R$ '): string => {
    if (isPrivate) {
      return `${prefix}••••••`
    }
    if (val === undefined || val === null) return `${prefix}0,00`
    if (typeof val === 'number') {
      return `${prefix}${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return String(val)
  }

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, setPrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  return useContext(PrivacyContext)
}
