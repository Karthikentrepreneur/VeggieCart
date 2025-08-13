import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Heart, ShoppingCart, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/lib/types';

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { open: openCart } = useCartStore();
  const queryClient = useQueryClient();
  
  const [selectedCutStyle, setSelectedCutStyle] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('500');

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  // Set default cut style when product loads
  useState(() => {
    if (product && product.cutStyles.length > 0 && !selectedCutStyle) {
      setSelectedCutStyle(product.cutStyles[0]);
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('No product selected');
      
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: parseInt(selectedQuantity) / 500, // Convert grams to units
        cutStyle: selectedCutStyle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart!',
        description: `${product?.name} has been added to your cart.`,
      });
      openCart();
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
      if (!product) throw new Error('No product selected');
      
      await apiRequest('POST', '/api/wishlist', {
        productId: product.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: 'Added to wishlist!',
        description: `${product?.name} has been added to your wishlist.`,
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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    if (!selectedCutStyle) {
      toast({
        title: 'Please select a cut style',
        variant: 'destructive',
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    addToWishlistMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product not found
          </h1>
          <Link href="/catalog">
            <Button>Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const quantityOptions = [
    { value: '250', label: '250g', price: Math.round(parseFloat(product.price) * 0.25) },
    { value: '500', label: '500g', price: Math.round(parseFloat(product.price) * 0.5) },
    { value: '1000', label: '1kg', price: parseFloat(product.price) },
    { value: '2000', label: '2kg', price: parseFloat(product.price) * 2 },
  ];

  const selectedQuantityOption = quantityOptions.find(opt => opt.value === selectedQuantity);

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/catalog">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Shop</span>
            <span className="mx-2">/</span>
            <span className="capitalize">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-primary">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative mb-4">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                data-testid="img-product-main"
              />
              {product.isOrganic && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  Organic
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop'}
                  alt={`${product.name} view ${i}`}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  data-testid={`img-product-thumbnail-${i}`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                  ₹{selectedQuantityOption?.price}
                </span>
                {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{Math.round(parseFloat(product.originalPrice) * (selectedQuantityOption?.price || 1) / parseFloat(product.price))}
                  </span>
                )}
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Fresh for {product.freshnessDays} days
                </Badge>
              </div>
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg" data-testid="text-product-description">
                {product.description}
              </p>
            )}

            {/* Cut Style Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cut Style
              </Label>
              <RadioGroup 
                value={selectedCutStyle} 
                onValueChange={setSelectedCutStyle}
                className="grid grid-cols-2 gap-3"
              >
                {product.cutStyles.map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={style} 
                      id={style}
                      data-testid={`radio-cut-style-${style.toLowerCase()}`}
                    />
                    <Label 
                      htmlFor={style}
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      {style}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity
              </Label>
              <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
                <SelectTrigger data-testid="select-quantity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quantityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} - ₹{option.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Info */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Truck className="w-5 h-5 text-primary mr-2" />
                  <span>Delivery within 2-4 hours | FREE delivery on orders above ₹500</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || !selectedCutStyle}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
                disabled={addToWishlistMutation.isPending}
                data-testid="button-add-to-wishlist"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Nutritional Information */}
            {product.nutritionInfo && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Nutritional Information (per 100g)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Calories: {product.nutritionInfo.calories}</div>
                    <div>Protein: {product.nutritionInfo.protein}</div>
                    <div>Carbs: {product.nutritionInfo.carbs}</div>
                    <div>Fiber: {product.nutritionInfo.fiber}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
