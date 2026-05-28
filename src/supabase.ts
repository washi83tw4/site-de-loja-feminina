/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Product, Order, OperationType } from './types';

// Retrieve Supabase credentials from client-side environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ginrupwmrdoilkybsgsz.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_S3snboPa4Q0v1xVbd4FRtg_EtaORtBc';

// Detect if we are using the placeholder credentials or the client didn't supply them yet
export const isDemoMode = !supabaseUrl || 
                           supabaseUrl === 'YOUR_SUPABASE_URL' || 
                           supabaseUrl === 'placeholder-url' ||
                           supabaseUrl === 'placeholder' ||
                           !supabaseAnonKey || 
                           supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || 
                           supabaseAnonKey === 'placeholder-key' ||
                           supabaseAnonKey === 'placeholder';

// Initialize Supabase Client if not in Demo Mode
export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseAnonKey);

function handleSupabaseError(error: unknown, operationType: OperationType, context: string): never {
  const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
  console.error(`Supabase Error [${operationType}] in ${context}: `, errMsg);
  throw new Error(`Supabase API Error during ${operationType} within ${context}: ${errMsg}`);
}

// ----------------------------------------------------
// MOCK DATA SEED
// ----------------------------------------------------
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Camisa Básica Algodão Pima',
    description: 'Camiseta de gola redonda confeccionada em algodão Pima peruano de altíssima qualidade. Toque macio, brilho natural e durabilidade extrema.',
    price: 129.90,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    category: 'camisetas',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Off-White', 'Preto', 'Azul Marinho'],
    featured: true,
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'Camiseta Oversized Rocker',
    description: 'Modelagem ampla streetwear com caimento despojado. Desenvolvida em malha pesada fio 20.1 premium, com lavagem estonada vintage.',
    price: 149.90,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    category: 'camisetas',
    sizes: ['P', 'M', 'G'],
    colors: ['Cinza Chumbo', 'Acid Black'],
    featured: true,
    createdAt: '2026-05-21T10:00:00Z'
  },
  {
    id: 'prod-3',
    name: 'Calça Cargo Combat Streetwear',
    description: 'Calça cargo confeccionada em ripstop de alta resistividade. Bolsos utilitários fáceis, ajuste em cordão na barra e cintura elástica para máximo conforto.',
    price: 249.90,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
    category: 'calcas',
    sizes: ['38', '40', '42', '44'],
    colors: ['Verde Militar', 'Preto', 'Bege'],
    featured: false,
    createdAt: '2026-05-22T10:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'Calça Chino Slim Comfort',
    description: 'Visual clássico de alfaiataria com elasticidade na medida certa. Ideal para ir do escritório direto para eventos casuais.',
    price: 199.90,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    category: 'calcas',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Khaki', 'Preto', 'Azul Marinho'],
    featured: true,
    createdAt: '2026-05-23T10:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Jaqueta Jeans Vintage Heritage',
    description: 'O clássico atemporal que melhora com o tempo. Confeccionada em jeans 100% algodão robusto com botões em metal envelhecido e lavagem média.',
    price: 329.90,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    category: 'casacos',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Jeans Médio', 'Jeans Escuro'],
    featured: true,
    createdAt: '2026-05-24T10:00:00Z'
  },
  {
    id: 'prod-6',
    name: 'Blusão Moletom Hoodie Minimalist',
    description: 'Moletom canguru super encorpado com forro peluciado macio. Capuz duplo ajustável e acabamento canelado nos punhos e barra.',
    price: 219.90,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    category: 'casacos',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Cinza Mescla', 'Preto', 'Off-White'],
    featured: false,
    createdAt: '2026-05-24T11:00:00Z'
  },
  {
    id: 'prod-7',
    name: 'Boné Strapback Sarja Premium',
    description: 'Boné desestruturado de gomos em sarja macia de alta qualidade. Ajuste traseiro em fita de couro com fivela de latão.',
    price: 89.90,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    category: 'acessorios',
    sizes: ['Único'],
    colors: ['Preto', 'Mostarda', 'Verde Escuro'],
    featured: false,
    createdAt: '2026-05-24T12:00:00Z'
  },
  {
    id: 'prod-8',
    name: 'Mochila Executive Couro & Lona',
    description: 'Espaço interno otimizado com compartimento acolchoado para notebook de até 15.6". Detalhes elegantes em couro legítimo.',
    price: 289.90,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    category: 'acessorios',
    sizes: ['Único'],
    colors: ['Marrom Café', 'Preto'],
    featured: true,
    createdAt: '2026-05-24T13:00:00Z'
  }
];

// Seed to localStorage for demo mode
if (isDemoMode) {
  const localStoredProducts = localStorage.getItem('clothes_products');
  if (!localStoredProducts) {
    localStorage.setItem('clothes_products', JSON.stringify(MOCK_PRODUCTS));
  }
}

// ----------------------------------------------------
// DATABASE API (MAPPING FUNCTIONS FOR PORTUGUESE SQL SCHEMA)
// ----------------------------------------------------

function mapDBProdutoToProduct(db: any): Product {
  // tamanho form DB is a string like "P, M, G" - we split by comma
  let sizes: string[] = [];
  if (db.tamanho) {
    sizes = db.tamanho.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (sizes.length === 0) {
    sizes = ['P', 'M', 'G', 'GG'];
  }

  return {
    id: db.id,
    name: db.nome || '',
    description: db.descricao || '',
    price: Number(db.preco || 0),
    imageUrl: db.imagem || '',
    category: db.categoria || 'all',
    sizes: sizes,
    stock: db.estoque || 0,
    createdAt: db.created_at || new Date().toISOString()
  };
}

function mapProductToDBProduto(item: Partial<Product>): any {
  // convert sizes array to string "P, M, G"
  const tamanhoStr = item.sizes ? item.sizes.join(', ') : 'P, M, G, GG';
  
  // construct default tamanhos_estoque if keys aren't present
  const tamanhosEstoque: Record<string, number> = {};
  if (item.sizes) {
    item.sizes.forEach(s => {
      tamanhosEstoque[s] = Math.ceil((item.stock || 15) / item.sizes!.length);
    });
  }

  return {
    nome: item.name,
    preco: item.price,
    categoria: item.category,
    tamanho: tamanhoStr,
    descricao: item.description || '',
    imagem: item.imageUrl || '',
    estoque: item.stock || 12,
    tamanhos_estoque: tamanhosEstoque
  };
}

/**
 * Validates connection to Supabase
 */
export async function validateSupabaseConnection() {
  if (isDemoMode) return true;
  try {
    const { error } = await supabase!.from('produtos').select('count', { count: 'exact', head: true });
    if (error) {
      console.warn("Supabase returned error. Running in secure offline-resilient mode:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Supabase appears offline. Running in secure offline-resilient mode.");
    return false;
  }
}

/**
 * Fetch all clothing products
 */
export async function getProducts(): Promise<Product[]> {
  if (isDemoMode) {
    const listJson = localStorage.getItem('clothes_products');
    return listJson ? JSON.parse(listJson) : MOCK_PRODUCTS;
  }

  try {
    const { data, error } = await supabase!
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // If database is empty, auto-populate it with mock clothes for rich initial UX
    if (!data || data.length === 0) {
      console.log("No products detected in Supabase, seeding 'produtos' table...");
      const seeded: Product[] = [];
      for (const item of MOCK_PRODUCTS) {
        const dbItem = mapProductToDBProduto(item);
        const { data: inserted, error: insertErr } = await supabase!
          .from('produtos')
          .insert([dbItem])
          .select('*')
          .single();

        if (insertErr) {
          console.error("Seeding error for single product, skipping...", insertErr);
          continue;
        }
        if (inserted) {
          seeded.push(mapDBProdutoToProduct(inserted));
        }
      }
      return seeded.length > 0 ? seeded : MOCK_PRODUCTS;
    }

    return data.map(mapDBProdutoToProduct);
  } catch (error) {
    return handleSupabaseError(error, OperationType.GET, 'produtos');
  }
}

/**
 * Place a customer order.
 */
export async function createOrder(order: Order): Promise<string> {
  if (isDemoMode) {
    const localOrders = localStorage.getItem('clothes_orders');
    const list: Order[] = localOrders ? JSON.parse(localOrders) : [];
    const generatedId = 'order-' + Math.random().toString(36).substring(2, 11);
    const newOrder = { ...order, id: generatedId };
    list.push(newOrder);
    localStorage.setItem('clothes_orders', JSON.stringify(list));
    return generatedId;
  }

  try {
    const { data, error } = await supabase!
      .from('orders')
      .insert([{
        userId: order.userId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error("Order was not created or ID not returned.");
    return String(data.id);
  } catch (error) {
    return handleSupabaseError(error, OperationType.CREATE, 'orders');
  }
}

/**
 * Fetch orders for authenticated user
 */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (isDemoMode) {
    const localOrders = localStorage.getItem('clothes_orders');
    const list: Order[] = localOrders ? JSON.parse(localOrders) : [];
    return list.filter(o => o.userId === userId);
  }

  try {
    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return (data || []) as Order[];
  } catch (error) {
    return handleSupabaseError(error, OperationType.LIST, 'orders');
  }
}

// ----------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------

/**
 * Triggers Google Sign-in Popup
 */
export async function loginWithGoogle() {
  if (isDemoMode) {
    // Return a beautiful mock user in demo mode
    const mockUser = {
      uid: 'demo-user-123',
      id: 'demo-user-123',
      displayName: 'Cliente Demonstrativo',
      email: 'cliente@exemplo.com.br',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    // Trigger window refresh to dispatch auth changes inside state
    window.dispatchEvent(new Event('auth-status-changed'));
    return mockUser;
  }

  try {
    const { data, error } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://site-de-loja-feminina.vercel.app"
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging in with Supabase: ', error);
    throw error;
  }
}

/**
 * Logs out current user
 */
export async function logoutUser() {
  if (isDemoMode) {
    localStorage.removeItem('demo_user');
    window.dispatchEvent(new Event('auth-status-changed'));
    return;
  }
  try {
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error logging out with Supabase: ', error);
  }
}

/**
 * Unified Auth Change state hook/subscriber
 */
export function subscribeToAuth(callback: (user: any | null) => void) {
  if (isDemoMode) {
    const checkUser = () => {
      const userStr = localStorage.getItem('demo_user');
      callback(userStr ? JSON.parse(userStr) : null);
    };
    checkUser();
    window.addEventListener('auth-status-changed', checkUser);
    return () => window.removeEventListener('auth-status-changed', checkUser);
  }

  // Get current session initially
  supabase!.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const user = {
        uid: session.user.id,
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
        photoURL: session.user.user_metadata?.avatar_url || ''
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user = {
        uid: session.user.id,
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
        photoURL: session.user.user_metadata?.avatar_url || ''
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
