"use client"

import { Button } from './button'
import { Card, CardContent } from './card'
import { useCartStore } from '@/lib/store'
import { getImageSrc } from '@/lib/image-utils'
import { Product } from '@/lib/supabase'
import { Plus, Minus } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  
  const cartItem = items.find(item => item.id === product.id)
  const currentQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url
      })
    }
    setQuantity(1)
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-gray-800 border-gray-700 overflow-hidden">
      <div className="aspect-w-16 aspect-h-12 overflow-hidden">
        <img
          src={getImageSrc(product.image_url)}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg'
          }}
        />
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-amber-500">Rp{product.price.toFixed(2)}</span>
          {currentQuantity > 0 && (
            <span className="text-sm text-gray-400">
              In cart: {currentQuantity}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0 border-gray-600"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-white min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0 border-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}