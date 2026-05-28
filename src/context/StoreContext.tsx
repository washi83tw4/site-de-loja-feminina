/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Category, Order } from '../types';
import { getProducts, subscribeToAuth, loginWithGoogle, logoutUser, createOrder, getOrdersForUser } from '../supabase';

interface StoreContextProps {
  products: Product[];
  isLoadingProducts: boolean;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, q: number) => void;
  clearCart: () => void;
  user: any | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkoutLoading: boolean;
  handleCheckout: (params: { customerName: string; customerPhone: string; comment?: string }) => Promise<void>;
  currentView: 'home' | 'product-detail' | 'orders';
  setCurrentView: (view: 'home' | 'product-detail' | 'orders') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  userOrders: Order[];
  fetchUserOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'product-detail' | 'orders'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Categories config
  const categories: Category[] = [
    { id: 'all', name: 'all', label: 'Tudo para você', icon: 'ShoppingBag' },
    { id: 'camisetas', name: 'camisetas', label: 'Blusas e Camisetas', icon: 'Shirt' },
    { id: 'calcas', name: 'calcas', label: 'Calças e Shorts', icon: 'Tag' },
    { id: 'casacos', name: 'casacos', label: 'Vestidos e Casacos', icon: 'Sparkles' },
    { id: 'acessorios', name: 'acessorios', label: 'Bolsas e Acessórios', icon: 'BriefcaseBusiness' }
  ];

  // Load products
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products from Supabase", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadData();
  }, []);

  // Sync auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch orders when user changes or goes to orders view
  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const orders = await getOrdersForUser(user.uid || user.id, user.email || undefined);
      // Sort orders descending by date
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserOrders(orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [user]);

  // Load cart from LocalStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('boutique_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Save cart to LocalStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('boutique_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, size: string, color?: string, quantity: number = 1) => {
    const itemId = `${product.id}-${size}-${color || ''}`;
    const existingIndex = cart.findIndex(item => item.id === itemId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: itemId,
        product,
        quantity,
        selectedSize: size,
        selectedColor: color
      };
      saveCart([...cart, newItem]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    const updated = cart.filter(item => item.id !== cartItemId);
    saveCart(updated);
  };

  const updateCartQuantity = (cartItemId: string, q: number) => {
    if (q <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const updated = cart.map(item => {
      if (item.id === cartItemId) {
        return { ...item, quantity: q };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const signIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCheckout = async (params: { customerName: string; customerPhone: string; comment?: string }) => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      
      const orderData: Order = {
        userId: user ? (user.uid || user.id) : 'anonymous',
        customerName: params.customerName,
        customerEmail: user?.email || undefined,
        customerPhone: params.customerPhone,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        total: subtotal,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      // Add order to DB
      await createOrder(orderData);
      
      // Build WhatsApp message
      // Example number for shop: standard config +5511999999999 or prompt template
      const formattedPhone = params.customerPhone.replace(/\D/g, '');
      const shopWhatsAppNumber = "5511999999999"; // Visual placeholder number, customisable or can send directly
      
      let message = `*🛍️ NOVO PEDIDO - BOUTIQUE PREMIUM*\n\n`;
      message += `*Cliente:* ${params.customerName}\n`;
      message += `*WhatsApp:* ${params.customerPhone}\n`;
      if (params.comment) {
        message += `*Observação:* ${params.comment}\n`;
      }
      message += `\n*🛒 PRODUTOS:*\n`;
      
      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.product.name}*\n`;
        message += `   Qtd: ${item.quantity}x | Tam: ${item.selectedSize}${item.selectedColor ? ` | Cor: ${item.selectedColor}` : ''}\n`;
        message += `   Preço: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\n*💰 TOTAL:* R$ ${subtotal.toFixed(2)}\n\n`;
      message += `Obrigado pela preferência! Aguardo instruções de pagamento.`;
      
      const encodedMsg = encodeURIComponent(message);
      const whatsAppUrl = `https://api.whatsapp.com/send?phone=${shopWhatsAppNumber}&text=${encodedMsg}`;
      
      // Clear the local cart
      clearCart();
      fetchUserOrders(); // update local list

      // Trigger redirect to WhatsApp in a safe manner
      window.open(whatsAppUrl, '_blank');
    } catch (err) {
      console.error("Order completion failed:", err);
      alert("Houve um problema ao finalizar o pedido no Supabase. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      isLoadingProducts,
      categories,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      user,
      signIn,
      signOut,
      checkoutLoading,
      handleCheckout,
      currentView,
      setCurrentView,
      selectedProductId,
      setSelectedProductId,
      userOrders,
      fetchUserOrders
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
};
