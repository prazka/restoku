"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Navigation } from '@/components/ui/navigation'
import { Upload, Plus, Edit, Trash2, Image as ImageIcon, Wand2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getImageSrc, createImagePreview } from '@/lib/image-utils'

type ExtractedProduct = {
  name: string
  description: string
  price: number
  image: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
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

  const extractProductInfo = async (file: File) => {
    setExtracting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Send to your backend endpoint
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ExtractedProduct = await response.json()
      
      // Set form data with extracted information
      setFormData({
        name: result.name || '',
        description: result.description || '',
        price: result.price || 0,
        image_url: result.image || ''
      })
      
      // Set image preview
      if (result.image) {
        setImagePreview(result.image)
      }
      
      setShowForm(true)
    } catch (error) {
      console.error('Error extracting product info:', error)
      
      // Fallback: create preview from uploaded file and show form
      try {
        const preview = await createImagePreview(file)
        setImagePreview(preview)
        setFormData({
          name: '',
          description: '',
          price: 0,
          image_url: preview
        })
        setShowForm(true)
        alert('AI extraction failed. Please fill in the product details manually.')
      } catch (previewError) {
        console.error('Error creating preview:', previewError)
        alert('Error processing image. Please try again.')
      }
    } finally {
      setExtracting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.')
        return
      }
      
      setUploading(true)
      extractProductInfo(file)
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.image_url) {
      alert('Please fill in all fields.')
      return
    }
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url
          })
          .eq('id', editingProduct.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url
          })
        
        if (error) throw error
      }

      // Reset form
      setFormData({ name: '', description: '', price: 0, image_url: '' })
      setImagePreview('')
      setEditingProduct(null)
      setShowForm(false)
      fetchProducts()
      
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
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
        alert('Product deleted successfully!')
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
    setImagePreview(product.image_url)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setImagePreview('')
    setFormData({ name: '', description: '', price: 0, image_url: '' })
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
                  <p className="text-gray-500 text-sm mt-2">
                    Supported formats: JPG, PNG, GIF (max 5MB)
                  </p>
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
                    {formData.name ? 'AI has extracted the product information. Review and edit if needed.' : 'Please fill in the product details manually.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Product Name *</Label>
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
                      <Label htmlFor="price" className="text-gray-300">Price (Rp) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Image Preview</Label>
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-full h-48 object-cover rounded-md border border-gray-600"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2"
                            size="sm"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="w-full h-48 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-400">Click to upload image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="image_url" className="text-gray-300">Image Data</Label>
                      <Textarea
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white h-20 text-xs"
                        placeholder="Image URL or base64 data"
                        readOnly
                      />
                    </div>
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
                    onClick={cancelForm}
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
                          target.src = 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-500 font-bold text-lg">
                          Rp{product.price.toFixed(2)}
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