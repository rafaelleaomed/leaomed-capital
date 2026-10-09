'use client'

import React, { useLayoutEffect, useRef } from 'react'

let openDialogCount = 0
let bodyOverflowBeforeDialogs = ''

/** Native modal semantics provide focus containment, Escape and an inert background. */
export function AccessibleDialog({ children, onClose, labelledBy, label, className, closeOnBackdrop = false }: {
  children: React.ReactNode
  onClose: () => void
  labelledBy?: string
  label?: string
  className?: string
  closeOnBackdrop?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (openDialogCount++ === 0) {
      bodyOverflowBeforeDialogs = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
      if (--openDialogCount === 0) document.body.style.overflow = bodyOverflowBeforeDialogs
      // Avoid moving focus out of another dialog opened by the completed action.
      if (trigger?.isConnected && (document.activeElement === document.body || document.activeElement === dialog)) trigger.focus()
    }
  }, [])

  return (
    <dialog ref={ref} aria-labelledby={labelledBy} aria-label={label} className={`capital-dialog ${className || ''}`}
      style={{ margin: 0, width: '100%', height: '100dvh', maxWidth: 'none', maxHeight: 'none', border: 0, color: 'var(--capital-text, #242a2e)', backgroundColor: 'rgba(17,22,27,.58)' }}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (closeOnBackdrop && event.target === event.currentTarget) onClose() }}>
      {children}
    </dialog>
  )
}
