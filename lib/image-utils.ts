// Utility functions for handling images

export const convertUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting URL to base64:', error)
    throw error
  }
}

export const convertBase64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: 'image/jpeg' })
}

export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/')
}

export const getImageSrc = (imageData: string): string => {
  // If it's already a valid URL, return as is
  if (imageData && (imageData.startsWith('http') || imageData.startsWith('https'))) {
    return imageData
  }
  
  // If it's base64, return as is
  if (imageData && isBase64Image(imageData)) {
    return imageData
  }
  
  // If it's a relative path, return as is
  if (imageData && imageData.startsWith('/')) {
    return imageData
  }
  
  // Fallback to placeholder
  return 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'
}

// Function to create object URL from file
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}