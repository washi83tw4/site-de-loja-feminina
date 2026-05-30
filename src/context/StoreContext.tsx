/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Category, Order } from '../types';
import { getProducts, subscribeToAuth, loginWithGoogle, logoutUser, createOrder, getOrdersForUser, updateOrderStatus } from '../supabase';

interface StoreContextProps {
  products: Product[];
  isLoadingProducts: boolean;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => boolean | void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, q: number) => void;
  clearCart: () => void;
  user: any | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkoutLoading: boolean;
  handleCheckout: (params: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCpf?: string;
    addressZipcode: string;
    addressStreet: string;
    addressNumber: string;
    addressComplement?: string;
    addressNeighborhood: string;
    addressCity: string;
    addressState: string;
    notes?: string;
  }) => Promise<string>;
  currentView: 'home' | 'product-detail' | 'orders';
  setCurrentView: (view: 'home' | 'product-detail' | 'orders') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  userOrders: Order[];
  fetchUserOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
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
    { id: 'all', name: 'all', label: 'Tudo', icon: 'ShoppingBag' },
    { id: 'camisetas', name: 'Camisetas', label: 'Camisetas', icon: 'Shirt' },
    { id: 'blusas', name: 'Blusas', label: 'Blusas', icon: 'Sparkles' },
    { id: 'calcas', name: 'Calças', label: 'Calças', icon: 'Layers' },
    { id: 'shorts', name: 'Shorts', label: 'Shorts', icon: 'Scissors' },
    { id: 'vestidos', name: 'Vestidos', label: 'Vestidos', icon: 'Sparkles' },
    { id: 'casacos', name: 'Casacos', label: 'Casacos', icon: 'Wind' },
    { id: 'saias', name: 'Saias', label: 'Saias', icon: 'Sparkles' },
    { id: 'bolsas', name: 'Bolsas', label: 'Bolsas', icon: 'Briefcase' },
    { id: 'acessorios', name: 'Acessórios', label: 'Acessórios', icon: 'Gem' },
    { id: 'sapatos', name: 'Sapatos', label: 'Sapatos', icon: 'Footprints' },
    { id: 'promocoes', name: 'promocoes', label: 'Promoções', icon: 'Percent' }
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

  const addToCart = (product: Product, size: string, color?: string, quantity: number = 1): boolean => {
    const stockAvailable = product.tamanhos_estoque?.[size] !== undefined
      ? product.tamanhos_estoque[size]
      : (product.stock || 0);

    const itemId = `${product.id}-${size}-${color || ''}`;
    const existingIndex = cart.findIndex(item => item.id === itemId);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (existingQty + quantity > stockAvailable) {
      alert(`Estoque insuficiente para este tamanho. Disponível: ${stockAvailable} unidades.`);
      return false;
    }

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
    return true;
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
        const itemStock = item.product.tamanhos_estoque?.[item.selectedSize] !== undefined
          ? item.product.tamanhos_estoque[item.selectedSize]
          : (item.product.stock || 0);
        
        const validatedQty = Math.min(q, itemStock);
        return { ...item, quantity: validatedQty };
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

  const handleCheckout = async (params: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCpf?: string;
    addressZipcode: string;
    addressStreet: string;
    addressNumber: string;
    addressComplement?: string;
    addressNeighborhood: string;
    addressCity: string;
    addressState: string;
    notes?: string;
  }): Promise<string> => {
    if (cart.length === 0) {
      throw new Error("Carrinho vazio");
    }

    // Double check stock on handleCheckout
    for (const item of cart) {
      const liveProduct = products.find(p => p.id === item.product.id) || item.product;
      const stockAvailable = liveProduct.tamanhos_estoque?.[item.selectedSize] !== undefined
        ? liveProduct.tamanhos_estoque[item.selectedSize]
        : (liveProduct.stock || 0);

      if (item.quantity > stockAvailable) {
        throw new Error(`O produto ${liveProduct.name} tamanho ${item.selectedSize} possui apenas ${stockAvailable} unidades disponíveis.`);
      }
    }

    setCheckoutLoading(true);
    try {
      const subtotal = cart.reduce((acc, item) => {
        const itemPrice = (item.product.onSale && item.product.promotionalPrice !== undefined) ? item.product.promotionalPrice : item.product.price;
        return acc + itemPrice * item.quantity;
      }, 0);
      
      const orderData: Order = {
        userId: user ? (user.uid || user.id) : 'anonymous',
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        customerCpf: params.customerCpf,
        addressZipcode: params.addressZipcode,
        addressStreet: params.addressStreet,
        addressNumber: params.addressNumber,
        addressComplement: params.addressComplement,
        addressNeighborhood: params.addressNeighborhood,
        addressCity: params.addressCity,
        addressState: params.addressState,
        notes: params.notes,
        items: cart.map(item => {
          const itemPrice = (item.product.onSale && item.product.promotionalPrice !== undefined) ? item.product.promotionalPrice : item.product.price;
          return {
            productId: item.product.id,
            name: item.product.name,
            price: itemPrice,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            imageUrl: item.product.imageUrl,
            subtotal: itemPrice * item.quantity
          };
        }),
        total: subtotal,
        status: 'Aguardando Pagamento',
        createdAt: new Date().toISOString()
      };

      // Add order to DB
      const orderId = await createOrder(orderData);
      
      // Clear the local cart
      clearCart();
      fetchUserOrders(); // update local list

      return orderId;
    } catch (err) {
      console.error("Order completion failed:", err);
      throw err;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const updateStoreOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await fetchUserOrders();
    } catch (err) {
      console.error("Failed to update store order status:", err);
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
      fetchUserOrders,
      updateOrderStatus: updateStoreOrderStatus
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
