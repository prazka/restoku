"use client"

import { useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { HeroSection } from '@/components/ui/hero-section'
import { MenuSection } from '@/components/ui/menu-section'
import { CartSidebar } from '@/components/ui/cart-sidebar'
import { Footer } from '@/components/ui/footer'
import { useCartStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <HeroSection />
      <MenuSection />
      <Footer />
      
      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-black p-4 rounded-full shadow-lg z-40"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}