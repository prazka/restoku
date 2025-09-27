"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Navigation } from '@/components/ui/navigation'
import { Upload, Plus, CreditCard as Edit, Trash2, Image as ImageIcon, Wand as Wand2, Loader as Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getImageSrc, convertUrlToBase64, isBase64Image } from '@/lib/image-utils'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractProductInfo = async (imageUrl: string) => {
    setExtracting(true)
    try {
      // Convert image to base64 if it's a URL
      let imageData = imageUrl
      if (!isBase64Image(imageUrl)) {
        try {
          imageData = await convertUrlToBase64(imageUrl)
        } catch (error) {
          console.warn('Failed to convert to base64, using URL:', error)
        }
      }
      
      // Simulated AI extraction - In real implementation, this would call LangChain
      // For now, we'll use a mock response based on common food items
      const mockExtractions = [
        {
          name: "Gourmet Burger",
          description: "Juicy beef patty with fresh lettuce, tomatoes, and our special sauce on a brioche bun",
          price: 15.99
        },
        {
          name: "Margherita Pizza",
          description: "Classic pizza with fresh mozzarella, basil, and tomato sauce on wood-fired crust",
          price: 18.50
        },
        {
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with parmesan cheese, croutons, and creamy caesar dressing",
          price: 12.99
        },
        {
          name: "Grilled Salmon",
          description: "Fresh Atlantic salmon grilled to perfection with herbs and lemon butter",
          price: 24.99
        }
      ]
      
      const randomExtraction = mockExtractions[Math.floor(Math.random() * mockExtractions.length)]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setFormData({
        ...randomExtraction,
        image_url: imageData
      })
      
      setShowForm(true)
    } catch (error) {
      console.error('Error extracting product info:', error)
      alert('Error extracting product information. Please fill in manually.')
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: imageUrl
      })
      setShowForm(true)
    } finally {
      setExtracting(false)
    }
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // For demo purposes, we'll use a placeholder image service
      const placeholderUrl = `https://images.pexels.com/photos/${1199957 + Math.floor(Math.random() * 100)}/pexels-photo-${1199957 + Math.floor(Math.random() * 100)}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`
      
      await extractProductInfo(placeholderUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id)
      } else {
        const { error } = await supabase
          .from('products')
          .insert(formData)
      }

      setFormData({ name: '', description: '', price: 0, image_url: '' })
      setEditingProduct(null)
      setShowForm(false)
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product. Please try again.')
    }
  }

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product. Please try again.')
      }
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Restaurant Admin Panel</h1>
          <p className="text-gray-400">Manage your menu items with AI-powered product extraction</p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-500" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {uploading || extracting ? (
                <div className="py-8">
                  <Loader2 className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">
                    {uploading ? 'Uploading image...' : 'Extracting product information with AI...'}
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload a product image and let AI extract the details</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Upload & Extract with AI
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Form */}
        {showForm && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingProduct ? 'Edit Product' : 'New Product Details'}
              </CardTitle>
              {!editingProduct && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <Wand2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-400">
                    AI has extracted the product information. Review and edit if needed.
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-gray-300">Price (Rp)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image_url" className="text-gray-300">Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        placeholder="Enter product description"
                      />
                    </div>

                    {formData.image_url && (
                      <div>
                        <Label className="text-gray-300">Preview</Label>
                        <img
                          src={getImageSrc(formData.image_url)}
                          alt="Product preview"
                          className="w-full h-32 object-cover rounded-md border border-gray-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                      setFormData({ name: '', description: '', price: 0, image_url: '' })
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Current Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No products added yet</p>
                <p className="text-gray-500 text-sm">Upload your first product image to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="bg-gray-700 border-gray-600">
                    <div className="aspect-w-16 aspect-h-12">
                      <img
                        src={getImageSrc(product.image_url)}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg'
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-500 font-bold text-lg">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(product)}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => deleteProduct(product.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}