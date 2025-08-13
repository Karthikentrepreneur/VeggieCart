import { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const checkoutSchema = z.object({
  deliveryAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pinCode: z.string().min(6, 'PIN code must be 6 digits').max(6, 'PIN code must be 6 digits'),
  }),
  paymentMethod: z.enum(['card', 'cash', 'upi']),
  deliverySlot: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// Demo cart items for local storage
const demoCartItems = [
  {
    id: '1',
    userId: 'demo-user',
    productId: '1',
    quantity: 2,
    cutStyle: 'Chopped',
    createdAt: new Date().toISOString(),
    product: {
      id: '1',
      name: 'Fresh Spinach',
      description: 'Premium quality organic spinach, rich in iron and vitamins',
      category: 'leafy',
      price: '45.00',
      originalPrice: '55.00',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
      cutStyles: ['Whole Leaves', 'Chopped', 'Baby Spinach'],
      freshnessDays: 3,
      isOrganic: true,
      isActive: true,
      stock: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: '2',
    userId: 'demo-user',
    productId: '2',
    quantity: 1,
    cutStyle: 'Diced',
    createdAt: new Date().toISOString(),
    product: {
      id: '2',
      name: 'Fresh Carrots',
      description: 'Sweet and crunchy carrots, perfect for cooking and salads',
      category: 'root',
      price: '32.00',
      originalPrice: '38.00',
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
      cutStyles: ['Whole', 'Diced', 'Julienne', 'Sliced'],
      freshnessDays: 7,
      isOrganic: false,
      isActive: true,
      stock: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use demo cart items for now
  const cartItems = demoCartItems;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        pinCode: '',
      },
      paymentMethod: 'cash',
      deliverySlot: '',
    },
  });

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    
    // Simulate order processing
    setTimeout(() => {
      toast({
        title: "Order placed successfully! 🎉",
        description: "You will receive a confirmation shortly. Order #ORD-" + Date.now().toString().slice(-6),
      });
      
      setIsSubmitting(false);
      setLocation('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your order in just a few steps
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryAddress.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryAddress.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deliveryAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main Street, Apartment 4B"
                            {...field}
                            data-testid="input-street"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Maharashtra" {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryAddress.pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="400001" maxLength={6} {...field} data-testid="input-pincode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Delivery Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="deliverySlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Delivery Slot (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-delivery-slot">
                              <SelectValue placeholder="Choose delivery time (or we'll deliver ASAP)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9am-12pm">9:00 AM - 12:00 PM</SelectItem>
                            <SelectItem value="12pm-3pm">12:00 PM - 3:00 PM</SelectItem>
                            <SelectItem value="3pm-6pm">3:00 PM - 6:00 PM</SelectItem>
                            <SelectItem value="6pm-9pm">6:00 PM - 9:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4"
                          >
                            <div className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="cash" id="cash" data-testid="radio-cash" />
                              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                <div className="font-semibold">💵 Cash on Delivery</div>
                                <div className="text-sm text-gray-500">Pay when your order arrives</div>
                              </Label>
                              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Most Popular</div>
                            </div>
                            <div className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="upi" id="upi" data-testid="radio-upi" />
                              <Label htmlFor="upi" className="flex-1 cursor-pointer">
                                <div className="font-semibold">📱 UPI Payment</div>
                                <div className="text-sm text-gray-500">Pay instantly with UPI</div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-primary/50 transition-colors">
                              <RadioGroupItem value="card" id="card" data-testid="radio-card" />
                              <Label htmlFor="card" className="flex-1 cursor-pointer">
                                <div className="font-semibold">💳 Credit/Debit Card</div>
                                <div className="text-sm text-gray-500">Pay with your card</div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=60&h=60&fit=crop'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.cutStyle} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span className="text-green-600 font-semibold">Free ✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span className="text-green-600 font-semibold">₹0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary text-xl" data-testid="text-checkout-total">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                    data-testid="button-place-order"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                      ✓ Free Delivery Guaranteed
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                      <div>🚚 Fresh vegetables delivered within 2-4 hours</div>
                      <div>🥬 100% freshness guarantee</div>
                      <div>🔄 Easy returns and refunds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}