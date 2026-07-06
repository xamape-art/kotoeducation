import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ExternalLink, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2C1008', color: '#D4B49A' }} className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-lg" style={{ backgroundColor: '#F5EDE3' }}>
                <Image src="/logo.png" alt="Koto Education" fill className="object-cover" sizes="40px" />
              </div>
              <div>
                <span
                  className="font-display font-bold text-base block"
                  style={{ color: '#F5EDE3' }}
                >
                  Koto Education
                </span>
                <span className="text-[10px] tracking-widest uppercase" style={{ color: '#C47A35' }}>
                  Terrassa
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#B89070' }}>
              Paseos y cuidados de mascotas en Terrassa con amor, experiencia y
              dedicación. ¡Tu peludito en las mejores manos!
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm tracking-widest uppercase mb-4" style={{ color: '#F5EDE3' }}>
              Servicios
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: '#B89070' }}>
              {[
                { href: '/servicios#paseo', label: 'Paseo de perros' },
                { href: '/servicios#visita', label: 'Visitas a domicilio' },
                { href: '/servicios#cuidado', label: 'Cuidado a domicilio' },
                { href: '/servicios#educacion', label: 'Educación canina' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#F5EDE3] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm tracking-widest uppercase mb-4" style={{ color: '#F5EDE3' }}>
              Contacto
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: '#B89070' }}>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: '#C47A35' }} />
                <span>Terrassa, Barcelona</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" style={{ color: '#C47A35' }} />
                <a href="tel:+34600000000" className="hover:text-[#F5EDE3] transition-colors">
                  +34 600 000 000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" style={{ color: '#C47A35' }} />
                <a href="mailto:hola@kotoeducation.com" className="hover:text-[#F5EDE3] transition-colors">
                  hola@kotoeducation.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 shrink-0" style={{ color: '#C47A35' }} />
                <a
                  href="https://instagram.com/kotoeducation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5EDE3] transition-colors"
                >
                  @kotoeducation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="border-t mt-10 pt-6 text-center text-sm"
          style={{ borderColor: '#4A2010', color: '#7A5030' }}
        >
          <p>© {new Date().getFullYear()} Koto Education. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
