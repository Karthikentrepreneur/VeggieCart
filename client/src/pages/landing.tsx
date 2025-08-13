import { ArrowRight, Leaf, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white hero-bg">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920&h=1080&fit=crop"
            alt="Fresh vegetables being prepared"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
            From Farm to Fork
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light animate-slide-up opacity-90">
            Freshly Cut for You
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
              asChild
              data-testid="button-get-started"
            >
              <a href="/api/login">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Veggies?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Premium quality, convenience, and freshness delivered to your door
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glassmorphism hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Fresh & Hygienic</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sourced directly from farms and processed in hygienic facilities to ensure maximum freshness and quality.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Cut to Your Preference</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose from dice, julienne, cubes, or slices. Get your vegetables cut exactly how you need them.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Same-day delivery available. Get your fresh cut vegetables delivered within 2-4 hours of ordering.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Fresh?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of customers who trust us for their daily vegetable needs.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-4"
            asChild
            data-testid="button-sign-up"
          >
            <a href="/api/login">
              Sign Up Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
