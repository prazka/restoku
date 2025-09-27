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
  // If it's already a URL, return as is
  if (imageData.startsWith('http') || imageData.startsWith('/')) {
    return imageData
  }
  
  // If it's base64, return as is
  if (isBase64Image(imageData)) {
    return imageData
  }
  
  // Fallback to placeholder
  return 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg'
}