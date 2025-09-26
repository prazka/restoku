"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Order } from '@/lib/supabase'
import { Navigation } from '@/components/ui/navigation'
import { Footer } from '@/components/ui/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CircleCheck as CheckCircle, Clock, Utensils, MapPin, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-gray-800 border-gray-700 text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
              <p className="text-gray-400 mb-6">We couldn't find the order you're looking for.</p>
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your order. We're preparing your delicious meal right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-amber-500" />
                Order Details
              </CardTitle>
              <p className="text-gray-400">Order ID: #{order.id.slice(0, 8)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={`${item.product_id}-${item.product_name}`} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <h3 className="text-white font-medium">{item.product_name}</h3>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-amber-500 font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold text-amber-500">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Customer Details</h3>
                <div className="space-y-2 text-gray-400">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Name:</span> {order.customer_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Delivery Address</h3>
                <p className="text-gray-400">{order.customer_address}</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-green-400 font-medium">Status: {order.status}</p>
                  <p className="text-gray-400 text-sm">Estimated delivery: 30-45 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 mr-4">
              Order Again
            </Button>
          </Link>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3">
            Track Order
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}