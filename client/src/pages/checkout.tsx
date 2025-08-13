import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CreditCard, Truck, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cartStore';
import { Link, useLocation } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { CartItem, DeliveryAddress } from '@/lib/types';

const deliveryAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(6, 'PIN code must be 6 digits').max(6, 'PIN code must be 6 digits'),
});

const deliverySlots = [
  { id: 'today-2-6', label: 'Today', time: '2:00 PM - 6:00 PM', price: 0 },
  { id: 'tomorrow-10-2', label: 'Tomorrow', time: '10:00 AM - 2:00 PM', price: 0 },
  { id: 'tomorrow-2-6', label: 'Tomorrow', time: '2:00 PM - 6:00 PM', price: 0 },
];

const paymentMethods = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: CreditCard },
  { id: 'cod', label: 'Cash on Delivery', icon: CreditCard },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(deliverySlots[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { close: closeCart, setItems } = useCartStore();
  const queryClient = useQueryClient();

  const form = useForm<DeliveryAddress>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Unauthorized',
        description: 'You need to sign in to access checkout. Redirecting...',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
    },
  });

  // Update cart store
  useEffect(() => {
    setItems(cartItems);
  }, [cartItems, setItems]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: DeliveryAddress) => {
      const orderData = {
        totalAmount: total.toString(),
        deliveryAddress: data,
        deliverySlot: deliverySlots.find(slot => slot.id === selectedDeliverySlot)?.label + ' ' + 
                     deliverySlots.find(slot => slot.id === selectedDeliverySlot)?.time,
        paymentMethod: paymentMethods.find(method => method.id === selectedPaymentMethod)?.label || 'Card',
        paymentStatus: 'pending',
        status: 'pending',
      };

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        cutStyle: item.cutStyle,
        price: item.product.price,
      }));

      await apiRequest('POST', '/api/orders', { orderData, orderItems });
    },
    onSuccess: () => {
      toast({
        title: 'Order placed successfully! 🎉',
        description: 'You will receive a confirmation email shortly.',
      });
      
      // Clear cart and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      closeCart();
      
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: DeliveryAddress) => {
    placeOrderMutation.mutate(data);
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Link href="/catalog">
              <Button data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/catalog">
            <Button variant="ghost" className="mb-4" data-testid="button-back-to-catalog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-delivery-address">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} data-testid="input-street" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PIN code" {...field} data-testid="input-pin-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Delivery Slot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Delivery Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDeliverySlot} onValueChange={setSelectedDeliverySlot}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deliverySlots.map((slot) => (
                      <div key={slot.id}>
                        <RadioGroupItem
                          value={slot.id}
                          id={slot.id}
                          className="peer sr-only"
                          data-testid={`radio-delivery-slot-${slot.id}`}
                        />
                        <Label
                          htmlFor={slot.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{slot.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{slot.time}</p>
                          </div>
                          <span className="text-primary font-medium">
                            {slot.price === 0 ? 'FREE' : `₹${slot.price}`}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.id}>
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer sr-only"
                            data-testid={`radio-payment-${method.id}`}
                          />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                            <span>{method.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3" data-testid={`checkout-item-${item.product.id}`}>
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=60&h=60&fit=crop'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.cutStyle} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span data-testid="text-delivery-fee">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18%)</span>
                    <span data-testid="text-tax">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-total">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Estimated delivery: 2-4 hours</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={placeOrderMutation.isPending}
                  className="w-full mt-6"
                  size="lg"
                  data-testid="button-place-order"
                >
                  {placeOrderMutation.isPending ? 'Processing...' : `Place Order - ₹${total.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
