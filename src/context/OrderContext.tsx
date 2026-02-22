import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (shippingAddress: ShippingAddress) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();

  // Load orders from backend when user changes
  useEffect(() => {
    const loadOrders = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await fetch(`/api/orders/user/${user.uid}`);
          if (response.ok) {
            const backendOrders = await response.json();
            const parsedOrders = backendOrders.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt)
            }));
            setOrders(parsedOrders);
          } else {
            // Fallback to localStorage if backend fails
            const savedOrders = localStorage.getItem(`orders_${user.uid}`);
            if (savedOrders) {
              const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
                ...order,
                createdAt: new Date(order.createdAt),
                updatedAt: new Date(order.updatedAt)
              }));
              setOrders(parsedOrders);
            }
          }
        } catch (error) {
          console.error('Failed to load orders from backend:', error);
          // Fallback to localStorage if backend fails
          const savedOrders = localStorage.getItem(`orders_${user.uid}`);
          if (savedOrders) {
            const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt)
            }));
            setOrders(parsedOrders);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setOrders([]);
      }
    };

    loadOrders();
  }, [user]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(`orders_${user.uid}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ZYR-${timestamp}-${random}`;
  };

  const createOrder = async (shippingAddress: ShippingAddress): Promise<Order> => {
    if (!user) {
      throw new Error('User must be authenticated to create an order');
    }

    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    setLoading(true);

    try {
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          quantity: item.quantity
        })),
        shippingAddress,
        subtotal,
        tax,
        total,
        orderNumber: generateOrderNumber()
      };

      // Call backend API to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create order: ${errorText}`);
      }

      const createdOrder = await response.json();

      // Convert to local format
      const newOrder: Order = {
        ...createdOrder,
        createdAt: new Date(createdOrder.createdAt),
        updatedAt: new Date(createdOrder.updatedAt)
      };

      // Add order to state
      setOrders(prevOrders => [newOrder, ...prevOrders]);

      // Clear cart after order is created
      clearCart();

      // Simulate order processing
      setTimeout(() => {
        updateOrderStatus(newOrder.id, 'processing');
      }, 2000);

      // Simulate shipping
      setTimeout(() => {
        updateOrderStatus(newOrder.id, 'shipped');
      }, 5000);

      return newOrder;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const refreshOrders = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/user/${user.uid}`);
      if (response.ok) {
        const backendOrders = await response.json();
        const parsedOrders = backendOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
        setOrders(parsedOrders);
        localStorage.setItem(`orders_${user.uid}`, JSON.stringify(parsedOrders));
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    setLoading(true);
    try {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'cancelled' as const, updatedAt: new Date() }
            : order
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    setLoading(true);
    try {
      // Update backend first
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state if backend update succeeded
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date() }
              : order
          )
        );
      } else {
        console.error('Failed to update order status in backend');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Still update local state even if backend fails
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date() }
            : order
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    loading,
    createOrder,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    refreshOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;