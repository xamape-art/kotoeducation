import Link from 'next/link'
import { PawPrint, MapPin, ExternalLink, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <PawPrint className="h-6 w-6" />
              <span>Koto Education</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Paseos y cuidados de mascotas en Terrassa con amor, experiencia y
              dedicación. ¡Tu peludito en las mejores manos!
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/servicios#paseo" className="hover:text-primary-foreground transition-colors">
                  Paseo de perros
                </Link>
              </li>
              <li>
                <Link href="/servicios#visita" className="hover:text-primary-foreground transition-colors">
                  Visitas a domicilio
                </Link>
              </li>
              <li>
                <Link href="/servicios#cuidado" className="hover:text-primary-foreground transition-colors">
                  Cuidado a domicilio
                </Link>
              </li>
              <li>
                <Link href="/servicios#educacion" className="hover:text-primary-foreground transition-colors">
                  Educación canina
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Terrassa, Barcelona</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+34600000000" className="hover:text-primary-foreground transition-colors">
                  +34 600 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:hola@kotoeducation.com" className="hover:text-primary-foreground transition-colors">
                  hola@kotoeducation.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 shrink-0" />
                <a
                  href="https://instagram.com/kotoeducation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground transition-colors"
                >
                  @kotoeducation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Koto Education. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
