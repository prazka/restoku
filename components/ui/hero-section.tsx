import { Button } from './button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu')
    menuSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative bg-gray-900 text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg"
          alt="Delicious food"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Exceptional Flavors,
            <span className="text-amber-500"> Delivered Fresh</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Experience culinary excellence with our carefully crafted dishes made from the finest ingredients, delivered straight to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={scrollToMenu}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 text-lg group"
            >
              Order Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
            >
              View Menu
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}