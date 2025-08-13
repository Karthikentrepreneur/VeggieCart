import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

export default function CartSidebar() {
  const { isOpen, close } = useCartStore();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  // Calculate total price from fetched items
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  };

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  // Remove cart item mutation
  const removeCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartMutation.mutate(id);
    } else {
      updateCartMutation.mutate({ id, quantity: newQuantity });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={close} data-testid="button-close-cart">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
              <Link href="/catalog">
                <Button onClick={close} data-testid="button-start-shopping">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg"
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <img
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate dark:text-white">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.cutStyle}</p>
                    <p className="text-xs text-primary">₹{item.product.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updateCartMutation.isPending}
                      data-testid={`button-decrease-${item.product.id}`}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updateCartMutation.isPending}
                      data-testid={`button-increase-${item.product.id}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-700 ml-2"
                      onClick={() => removeCartMutation.mutate(item.id)}
                      disabled={removeCartMutation.isPending}
                      data-testid={`button-remove-${item.product.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold dark:text-white">Total:</span>
              <span className="text-xl font-bold text-primary" data-testid="text-cart-total">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Link href="/checkout">
              <Button 
                className="w-full" 
                onClick={close}
                data-testid="button-proceed-checkout"
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
