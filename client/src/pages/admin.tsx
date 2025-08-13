import { useState, useEffect } from 'react';
import { BarChart3, Package, Users, ShoppingCart, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Product, Order } from '@/lib/types';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Unauthorized',
        description: 'You need to sign in to access the admin panel. Redirecting...',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
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

  // Fetch all orders (admin)
  const { data: allOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/all'],
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

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/all'] });
      toast({
        title: 'Order updated',
        description: 'Order status has been updated successfully.',
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
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    },
  });

  // Calculate stats
  const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalCustomers = new Set(allOrders.map(order => order.userId)).size;
  const activeProducts = products.filter(product => product.isActive).length;

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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'leafy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'root':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'seasonal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'organic':
        return 'bg-primary/10 text-primary';
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your products, orders, and business operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-orders">
                    {allOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-revenue">
                    ₹{totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-customers">
                    {totalCustomers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-products">
                    {activeProducts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="w-full justify-start p-6 bg-transparent">
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-products"
                >
                  Products
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-orders"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-customers"
                >
                  Customers
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-analytics"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Products Tab */}
              <TabsContent value="products" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">Products</h2>
                  <Button data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {productsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.slice(0, 10).map((product) => (
                          <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=60&h=60&fit=crop'}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <div>
                                  <p className="font-medium dark:text-white">{product.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.isOrganic ? 'Organic' : 'Regular'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getCategoryColor(product.category)}>
                                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="dark:text-white">₹{product.price}</TableCell>
                            <TableCell>
                              <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={product.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" data-testid={`button-view-product-${product.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" data-testid={`button-edit-product-${product.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" data-testid={`button-delete-product-${product.id}`}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">Orders</h2>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48" data-testid="select-order-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
                  </div>
                ) : allOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No orders found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Orders will appear here once customers start placing them
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allOrders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        data-testid={`admin-order-${order.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Customer ID: {order.userId.slice(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold dark:text-white">₹{order.totalAmount}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              <Select
                                value={order.status}
                                onValueChange={(newStatus) => 
                                  updateOrderStatusMutation.mutate({ orderId: order.id, status: newStatus })
                                }
                              >
                                <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium dark:text-white mb-1">Items:</h4>
                            <div className="space-y-1">
                              {order.orderItems.map((item) => (
                                <p key={item.id} className="text-gray-600 dark:text-gray-400">
                                  {item.product.name} ({item.cutStyle}) × {item.quantity}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium dark:text-white mb-1">Delivery:</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {order.deliverySlot || 'Standard delivery'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Payment: {order.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-order-details-${order.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">Customers</h2>
                </div>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Customer Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Customer management features are coming soon
                  </p>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">Analytics</h2>
                </div>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed analytics and reporting features are coming soon
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
