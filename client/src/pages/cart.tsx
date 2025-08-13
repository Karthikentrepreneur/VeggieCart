import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartMutation.mutate(id);
    } else {
      updateCartMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to be signed in to view your cart
            </p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/catalog')}
            data-testid="button-back-catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Cart</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet
              </p>
              <Button asChild size="lg" data-testid="button-continue-shopping">
                <Link href="/catalog">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&h=150&fit=crop'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        data-testid={`img-product-${item.product.id}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cut Style: {item.cutStyle}
                        </p>
                        <p className="text-lg font-semibold text-primary mt-2">
                          ₹{item.product.price}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updateCartMutation.isPending}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm w-8 text-center" data-testid={`quantity-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updateCartMutation.isPending}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeCartMutation.mutate(item.id)}
                          disabled={removeCartMutation.isPending}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span data-testid="text-subtotal">₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-primary" data-testid="text-total">
                          ₹{getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    asChild
                    data-testid="button-proceed-checkout"
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Free Delivery
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enjoy free delivery on all orders. Fresh vegetables delivered to your doorstep within 2-4 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}