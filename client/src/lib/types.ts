export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  cutStyles: string[];
  freshnessDays: number;
  isOrganic: boolean;
  nutritionInfo?: {
    protein: string;
    carbs: string;
    fiber: string;
    calories: string;
  };
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  cutStyle: string;
  createdAt: string;
  product: Product;
}

export interface CartStore {
  isOpen: boolean;
  items: CartItem[];
  toggle: () => void;
  open: () => void;
  close: () => void;
  setItems: (items: CartItem[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface DeliveryAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: string;
  deliveryAddress: DeliveryAddress;
  deliverySlot?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  cutStyle: string;
  price: string;
  createdAt: string;
  product: Product;
}
