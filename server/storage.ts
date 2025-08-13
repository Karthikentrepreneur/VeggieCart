import {
  users,
  products,
  cartItems,
  orders,
  orderItems,
  wishlist,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Wishlist operations
  getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
}

// Memory storage with demo data
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private cartItems: Map<string, CartItem & { product: Product }> = new Map();
  private orders: Map<string, Order & { orderItems: (OrderItem & { product: Product })[] }> = new Map();
  private wishlists: Map<string, Wishlist & { product: Product }> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Demo Products
    const demoProducts: Product[] = [
      {
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
        nutritionInfo: {
          protein: '2.9g',
          carbs: '3.6g',
          fiber: '2.2g',
          calories: '23'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
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
        nutritionInfo: {
          protein: '0.9g',
          carbs: '9.6g',
          fiber: '2.8g',
          calories: '41'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Bell Peppers Mix',
        description: 'Colorful mix of red, yellow, and green bell peppers',
        category: 'seasonal',
        price: '75.00',
        originalPrice: '85.00',
        imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop',
        cutStyles: ['Whole', 'Strips', 'Diced', 'Rings'],
        freshnessDays: 5,
        isOrganic: true,
        isActive: true,
        stock: 40,
        nutritionInfo: {
          protein: '1.9g',
          carbs: '9.0g',
          fiber: '2.5g',
          calories: '31'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Fresh Broccoli',
        description: 'Nutrient-rich broccoli florets, high in vitamin C',
        category: 'seasonal',
        price: '68.00',
        imageUrl: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=300&fit=crop',
        cutStyles: ['Florets', 'Chopped', 'Whole Head'],
        freshnessDays: 4,
        isOrganic: false,
        isActive: true,
        stock: 30,
        nutritionInfo: {
          protein: '2.8g',
          carbs: '6.6g',
          fiber: '2.6g',
          calories: '34'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Organic Kale',
        description: 'Superfood kale leaves, packed with antioxidants',
        category: 'leafy',
        price: '55.00',
        originalPrice: '65.00',
        imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=300&fit=crop',
        cutStyles: ['Whole Leaves', 'Chopped', 'Massage Ready'],
        freshnessDays: 5,
        isOrganic: true,
        isActive: true,
        stock: 35,
        nutritionInfo: {
          protein: '4.3g',
          carbs: '8.8g',
          fiber: '3.6g',
          calories: '49'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Fresh Tomatoes',
        description: 'Juicy and ripe tomatoes, perfect for salads and cooking',
        category: 'seasonal',
        price: '42.00',
        imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264e7ac1e?w=400&h=300&fit=crop',
        cutStyles: ['Whole', 'Sliced', 'Diced', 'Wedges'],
        freshnessDays: 6,
        isOrganic: false,
        isActive: true,
        stock: 60,
        nutritionInfo: {
          protein: '0.9g',
          carbs: '3.9g',
          fiber: '1.2g',
          calories: '18'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    demoProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product?.isActive ? product : undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive && p.category === category);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = Date.now().toString();
    const product: Product = {
      id,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    const id = Date.now().toString();
    const product = this.products.get(cartItemData.productId);
    if (!product) throw new Error('Product not found');

    const cartItem: CartItem & { product: Product } = {
      id,
      ...cartItemData,
      createdAt: new Date().toISOString(),
      product,
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(([, item]) => item.userId === userId);
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const orders = Array.from(this.orders.values());
    return userId ? orders.filter(order => order.userId === userId) : orders;
  }

  async getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = Date.now().toString();
    const orderItems = items.map((itemData, index) => {
      const product = this.products.get(itemData.productId);
      return {
        id: `${id}_${index}`,
        ...itemData,
        orderId: id,
        createdAt: new Date().toISOString(),
        product: product!,
      };
    });

    const order: Order & { orderItems: (OrderItem & { product: Product })[] } = {
      id,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderItems,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Wishlist operations
  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    return Array.from(this.wishlists.values()).filter(item => item.userId === userId);
  }

  async addToWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const id = Date.now().toString();
    const product = this.products.get(wishlistData.productId);
    if (!product) throw new Error('Product not found');

    const wishlistItem: Wishlist & { product: Product } = {
      id,
      ...wishlistData,
      createdAt: new Date().toISOString(),
      product,
    };
    this.wishlists.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const item = Array.from(this.wishlists.entries()).find(([, item]) => 
      item.userId === userId && item.productId === productId
    );
    if (item) {
      return this.wishlists.delete(item[0]);
    }
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(and(eq(products.category, category), eq(products.isActive, true)));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists with same product and cut style
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId),
          eq(cartItems.cutStyle, cartItem.cutStyle)
        )
      );

    if (existing) {
      // Update quantity if item exists
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount >= 0;
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersQuery = db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    if (userId) {
      ordersQuery.where(eq(orders.userId, userId));
    }

    const ordersList = await ordersQuery;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();

    // Insert order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Wishlist operations
  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    return await db
      .select()
      .from(wishlist)
      .innerJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId));
  }

  async addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist> {
    const [newItem] = await db.insert(wishlist).values(wishlistItem).returning();
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return result.rowCount > 0;
  }
}

export const storage = new MemoryStorage();
