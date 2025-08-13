import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isLoading } = useAuth();
  const { toggle: toggleCart, getTotalItems } = useCartStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/catalog' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Admin', href: '/admin' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Veggies</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      isActivePath(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:text-primary'
                    )}
                    data-testid={`nav-link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Search, Cart, and Auth */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search vegetables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* Auth Button */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Button asChild data-testid="button-logout">
                    <a href="/api/logout">Sign Out</a>
                  </Button>
                ) : (
                  <Button asChild data-testid="button-login">
                    <a href="/api/login">Sign In</a>
                  </Button>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-sm font-medium',
                      isActivePath(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:text-primary'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}

              {/* Mobile Search */}
              <div className="relative pt-2">
                <Input
                  type="text"
                  placeholder="Search vegetables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-mobile-search"
                />
                <Search className="absolute left-3 top-5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
