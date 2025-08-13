import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ProductCard from '@/components/product/product-card';
import type { Product } from '@/lib/types';

export default function Home() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center text-white hero-bg">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920&h=600&fit=crop"
            alt="Fresh vegetables being prepared"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
            Welcome Back!
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light animate-slide-up opacity-90">
            Fresh vegetables, perfectly cut, ready for your kitchen
          </p>
          <Link href="/catalog">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
              data-testid="button-shop-now"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600 dark:text-gray-400">Fresh Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-success mb-2">2-4hrs</div>
                <div className="text-gray-600 dark:text-gray-400">Delivery Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">100%</div>
                <div className="text-gray-600 dark:text-gray-400">Fresh Guarantee</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Handpicked fresh vegetables for your healthy lifestyle
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" data-testid="button-view-all">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore our wide range of fresh vegetable categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Leafy Greens', count: 12, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop', href: '/catalog?category=leafy' },
              { name: 'Root Vegetables', count: 8, image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=200&fit=crop', href: '/catalog?category=root' },
              { name: 'Seasonal', count: 15, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=200&fit=crop', href: '/catalog?category=seasonal' },
              { name: 'Organic', count: 10, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=200&fit=crop', href: '/catalog?category=organic' },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs opacity-90">{category.count} products</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="py-16 bg-neutral dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Reorder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No recent orders found
                </p>
                <Link href="/catalog">
                  <Button data-testid="button-start-shopping">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
