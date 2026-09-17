'use client'

import { useState } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

const SHARE_TEXT = 'Koto Education 🐾 Educación canina, paseos y cuidado de mascotas a domicilio en Terrassa'

export default function ShareButtons() {
  const [copied, setCopied] = useState(false)

  const getUrl = () => window.location.href.split(/[?#]/)[0]

  async function handleShare() {
    const url = getUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Koto Education', text: SHARE_TEXT, url })
      } catch {
        // El usuario ha cancelado el diálogo
      }
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${url}`)}`, '_blank', 'noopener,noreferrer')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      toast.success('Enlace copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se ha podido copiar el enlace')
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition hover:bg-[#F5EDE3] active:scale-[0.98]"
        style={{ borderColor: '#E2C2AF', color: '#2C1008' }}
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition hover:bg-[#F5EDE3] active:scale-[0.98]"
        style={{ borderColor: '#E2C2AF', color: '#2C1008' }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </button>
    </div>
  )
}
