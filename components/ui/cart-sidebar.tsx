"use client"

import { useCartStore } from '@/lib/store'
import { getImageSrc } from '@/lib/image-utils'
import { Button } from './button'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-white">Your Cart</h2>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
                <p className="text-gray-500 text-sm mt-2">Add some delicious items to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <img
                      src={getImageSrc(item.image_url)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">Rp{item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0 border-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white text-sm min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0 border-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-700 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-2xl font-bold text-amber-500">
                  Rp{getTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}