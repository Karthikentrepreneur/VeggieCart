import { useState, useEffect } from 'react';
import { User, Package, Calendar, MapPin, Heart, Edit, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Order, Wishlist } from '@/lib/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Unauthorized',
        description: 'You need to sign in to access your dashboard. Redirecting...',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
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

  // Fetch wishlist
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery<Wishlist[]>({
    queryKey: ['/api/wishlist'],
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

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
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
        description: 'Failed to remove item from wishlist.',
        variant: 'destructive',
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
        cutStyle: 'Diced', // Default cut style
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart!',
        description: 'Item has been added to your cart.',
      });
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
        description: 'Failed to add item to cart.',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'processing':
        return 'bg-accent/10 text-accent';
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your orders, preferences, and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">
                      {user?.firstName || user?.email || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant={activeTab === 'orders' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('orders')}
                    data-testid="tab-orders"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                  <Button
                    variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('subscriptions')}
                    data-testid="tab-subscriptions"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Subscriptions
                  </Button>
                  <Button
                    variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('addresses')}
                    data-testid="tab-addresses"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Addresses
                  </Button>
                  <Button
                    variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('wishlist')}
                    data-testid="tab-wishlist"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button
                    variant={activeTab === 'profile' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('profile')}
                    data-testid="tab-profile"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 dark:text-white">Order History</h2>
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No orders yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start shopping to see your orders here
                        </p>
                        <Link href="/catalog">
                          <Button data-testid="button-start-shopping">Start Shopping</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            data-testid={`order-${order.id}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold dark:text-white">₹{order.totalAmount}</p>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                  <img
                                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=60&h=60&fit=crop'}
                                    alt={item.product.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium dark:text-white">{item.product.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.cutStyle} | Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium dark:text-white">₹{item.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Truck className="w-4 h-4 mr-1" />
                                <span>{order.deliverySlot || 'Standard delivery'}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCartMutation.mutate(order.orderItems[0]?.productId)}
                                disabled={addToCartMutation.isPending}
                                data-testid={`button-reorder-${order.id}`}
                              >
                                Reorder
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 dark:text-white">My Subscriptions</h2>
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No active subscriptions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Set up a weekly or monthly veggie subscription for convenience
                      </p>
                      <Button data-testid="button-create-subscription">Create Subscription</Button>
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 dark:text-white">Saved Addresses</h2>
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No saved addresses
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Add addresses for faster checkout
                      </p>
                      <Button data-testid="button-add-address">Add Address</Button>
                    </div>
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 dark:text-white">My Wishlist</h2>
                    {wishlistLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wishlist...</p>
                      </div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Your wishlist is empty
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Save items you love for later
                        </p>
                        <Link href="/catalog">
                          <Button data-testid="button-browse-products">Browse Products</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            data-testid={`wishlist-item-${item.product.id}`}
                          >
                            <Link href={`/product/${item.product.id}`}>
                              <img
                                src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop'}
                                alt={item.product.name}
                                className="w-full h-32 object-cover rounded mb-3 hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </Link>
                            <h3 className="font-medium mb-1 dark:text-white">{item.product.name}</h3>
                            <p className="text-primary font-semibold mb-3">₹{item.product.price}</p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => addToCartMutation.mutate(item.product.id)}
                                disabled={addToCartMutation.isPending}
                                data-testid={`button-add-to-cart-${item.product.id}`}
                              >
                                Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromWishlistMutation.mutate(item.product.id)}
                                disabled={removeFromWishlistMutation.isPending}
                                data-testid={`button-remove-wishlist-${item.product.id}`}
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 dark:text-white">Profile Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <p className="text-gray-900 dark:text-white">{user?.email || 'No email available'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.firstName || 'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Member Since
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
