import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={cn(
          'relative w-full max-w-lg transform rounded-xl bg-white p-6 text-left shadow-2xl transition-all sm:my-8',
          className,
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
