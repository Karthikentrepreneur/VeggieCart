import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
        cutStyle: product.cutStyles[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart!',
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart.',
        variant: 'destructive',
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/wishlist', {
        productId: product.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: 'Added to wishlist!',
        description: `${product.name} has been added to your wishlist.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist.',
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    addToWishlistMutation.mutate();
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isOrganic && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              Organic
            </Badge>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleAddToWishlist}
              disabled={addToWishlistMutation.isPending}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            data-testid={`button-add-cart-${product.id}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Fresh for {product.freshnessDays} days
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
                ₹{product.price}
              </span>
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{product.cutStyles.length} styles</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
