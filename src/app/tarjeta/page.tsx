import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail, MapPin, Phone, UserPlus } from 'lucide-react'
import { EMAIL, INSTAGRAM_HREF, PHONE_DISPLAY, PHONE_HREF, WHATSAPP_HREF } from '@/lib/contact'
import ShareButtons from './ShareButtons'

export const metadata: Metadata = {
  title: 'Koto Education 🐾 | Carla Martínez',
  description: 'Educación canina y paseos · Cuidado de mascotas a domicilio en Terrassa. Guarda mi contacto o escríbeme por WhatsApp.',
  openGraph: {
    title: 'Koto Education 🐾 | Carla Martínez',
    description: 'Educación canina y paseos · Cuidado de mascotas a domicilio en Terrassa.',
    type: 'profile',
    locale: 'es_ES',
  },
}

const WHATSAPP_MESSAGE = 'Hola Carla! 🐾 Te escribo desde tu tarjeta de Koto Education.'
const MAPS_HREF = 'https://www.google.com/maps/search/?api=1&query=Terrassa'

const SERVICES = ['Educación canina', 'Paseos', 'Cuidado a domicilio']

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41 2.51 0 4.88.98 6.65 2.76a9.35 9.35 0 0 1 2.75 6.66c0 5.19-4.23 9.41-9.41 9.41m8.01-17.43A11.26 11.26 0 0 0 12.05.75C5.82.75.74 5.82.74 12.06c0 2 .52 3.94 1.51 5.65L.65 23.25l5.67-1.49a11.3 11.3 0 0 0 5.73 1.46h.01c6.24 0 11.31-5.07 11.31-11.31 0-3.02-1.18-5.86-3.31-8" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </svg>
  )
}

const LINKS = [
  { label: 'Instagram', value: '@kotoeducation', href: INSTAGRAM_HREF, icon: InstagramIcon, external: true },
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, icon: Mail, external: false },
  { label: 'Teléfono', value: PHONE_DISPLAY, href: PHONE_HREF, icon: Phone, external: false },
  { label: 'Zona', value: 'Terrassa', href: MAPS_HREF, icon: MapPin, external: true },
]

export default function TarjetaPage() {
  return (
    <main
      className="flex-1 flex justify-center px-4 py-8 sm:py-14"
      style={{ background: 'linear-gradient(180deg, #F5EDE3 0%, #E9D3C4 100%)' }}
    >
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <article className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#2C1008]/10">
          {/* Cabecera */}
          <header className="relative flex flex-col items-center px-6 pt-8 pb-6 text-center" style={{ backgroundColor: '#F5EDE3' }}>
            <div className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-md">
              <Image src="/logo.png" alt="Logo Koto Education" fill priority sizes="144px" className="object-cover scale-110" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold tracking-wide" style={{ color: '#2C1008' }}>
              KOTO EDUCATION
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: '#C47A35' }}>
              Carla Martínez
            </p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5A3522' }}>
              Educación canina y paseos
              <br />
              Cuidado de mascotas a domicilio
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
              {SERVICES.map((s) => (
                <li
                  key={s}
                  className="rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: '#E2C2AF', color: '#2C1008' }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </header>

          <div className="space-y-3 px-5 py-6">
            {/* Acciones principales */}
            <a
              href={`${WHATSAPP_HREF}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.98] hover:brightness-95"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Escríbeme por WhatsApp
            </a>
            <a
              href="/tarjeta/koto-education.vcf"
              download="Koto Education.vcf"
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold transition active:scale-[0.98] hover:brightness-110"
              style={{ backgroundColor: '#2C1008', color: '#F5EDE3' }}
            >
              <UserPlus className="h-5 w-5" />
              Guardar contacto
            </a>

            {/* Enlaces */}
            <ul className="divide-y divide-[#EFE2D8] pt-2">
              {LINKS.map(({ label, value, href, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-4 rounded-xl px-2 py-3 transition hover:bg-[#F5EDE3]"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition group-hover:scale-105"
                      style={{ backgroundColor: '#2C1008', color: '#F5EDE3' }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-wider" style={{ color: '#B08068' }}>
                        {label}
                      </span>
                      <span className="block truncate text-[15px] font-medium" style={{ color: '#2C1008' }}>
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <ShareButtons />
          </div>
        </article>

        <p className="mt-6 text-center text-xs" style={{ color: '#8A6250' }}>
          🐾 Tu peludito en las mejores manos
        </p>
      </div>
    </main>
  )
}
