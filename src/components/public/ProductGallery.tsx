'use client'

import { useState } from 'react'
import { PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-secondary/60 flex items-center justify-center">
        <PawPrint className="h-16 w-16 text-primary/30" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/60">
        <img src={images[active]} alt={name} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={cn(
                'h-16 w-16 shrink-0 rounded-lg overflow-hidden ring-2 transition',
                i === active ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
