import { UtensilsCrossed, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-8 w-8 text-amber-500" />
              <span className="text-xl font-bold">Savory</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Exceptional flavors delivered fresh to your door. Experience culinary excellence with every bite.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-500">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>123 Gourmet Street<br />Food District, FD 12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>hello@savory.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-500">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="#menu" className="block text-gray-400 hover:text-white transition-colors">
                Menu
              </Link>
              <Link href="/checkout" className="block text-gray-400 hover:text-white transition-colors">
                Checkout
              </Link>
              <Link href="/admin" className="block text-gray-400 hover:text-white transition-colors">
                Admin Panel
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-500">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Follow us for the latest updates, special offers, and behind-the-scenes content.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Savory Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}