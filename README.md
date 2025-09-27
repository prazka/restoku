# Restoku - Restaurant Web Application

A modern restaurant web application built with Next.js, featuring both public-facing menu and admin panel with AI-powered product management.

## Features

### Public Side
- Modern landing page with hero section
- Interactive menu with product cards
- Shopping cart functionality
- Checkout process with order management
- Order confirmation and tracking

### Admin Panel
- Product management with CRUD operations
- AI-powered product extraction from images
- Image upload and storage
- Order management dashboard

## Image Storage

The application supports flexible image storage:

### Current Implementation
- **Database**: Stores image data in `products.image_url` column
- **Format Support**: Both HTTP URLs and base64 data URIs
- **Fallback**: Automatic fallback to placeholder images on error

### Image Formats Supported
1. **HTTP URLs**: `https://example.com/image.jpg`
2. **Base64 Data URIs**: `data:image/jpeg;base64,/9j/4AAQSkZJRgABA...`

### Utility Functions
- `getImageSrc()`: Handles both URL and base64 formats
- `convertUrlToBase64()`: Converts URLs to base64
- `isBase64Image()`: Checks if string is base64 image

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure Supabase:
- Create a new Supabase project
- Run the migrations in `supabase/migrations/`
- Update environment variables with your Supabase credentials

4. Start development server:
```bash
npm run dev
```

## Database Schema

### Products Table
- `id`: UUID primary key
- `name`: Product name
- `description`: Product description  
- `price`: Product price (numeric)
- `image_url`: Image data (URL or base64)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Orders Table
- `id`: UUID primary key
- `customer_name`: Customer name
- `customer_email`: Customer email
- `customer_phone`: Customer phone
- `customer_address`: Delivery address
- `items`: Order items (JSONB)
- `total_amount`: Order total
- `status`: Order status
- `created_at`: Timestamp

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Image Processing**: Custom utilities for URL/base64 handling
- **AI Integration**: Ready for LangChain integration

## Color Palette

- **Primary**: Dark Gray (#374151)
- **Secondary**: Black (#111827) 
- **Accent**: Brown (#92400E, #A16207)
- **Highlight**: Amber (#F59E0B)

## Deployment

The application is configured for static export and can be deployed to:
- Vercel
- Netlify  
- Bolt Hosting
- Any static hosting service
