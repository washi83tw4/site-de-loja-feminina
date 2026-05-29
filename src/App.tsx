/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { CatalogSection } from './components/CatalogSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { OrdersHistory } from './components/OrdersHistory';
import { Cart } from './components/Cart';
import { PaymentStatus } from './components/PaymentStatus';
import { CreditCard, Eye, ShieldCheck, Mail, Phone, MapPin, Loader2, Sparkles } from 'lucide-react';

function StoreShell() {
  const { 
    products, 
    isLoadingProducts, 
    selectedCategory, 
    searchQuery, 
    currentView,
    setSelectedCategory,
    setSearchQuery 
  } = useStore();

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Extract path and identify payment redirects
  const pathname = window.location.pathname;
  const isPaymentSuccess = pathname === '/pagamento/sucesso' || pathname.startsWith('/pagamento/sucesso');
  const isPaymentError = pathname === '/pagamento/erro' || pathname.startsWith('/pagamento/erro');
  const isPaymentPending = pathname === '/pagamento/pendente' || pathname.startsWith('/pagamento/pendente');
  const isPaymentPage = isPaymentSuccess || isPaymentError || isPaymentPending;

  // Filter products by selected category and active search queries
  const filteredProducts = products.filter(product => {
    // Only display active products (ativo = true)
    if (product.active === false) return false;

    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'promocoes') {
      matchesCategory = product.onSale === true;
    } else {
      // Robust normalized case-insensitive & accent-insensitive comparison
      const normalize = (str: string) => {
        return (str || '')
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();
      };
      const prodCatClean = normalize(product.category);
      const selCatClean = normalize(selectedCategory);
      matchesCategory = prodCatClean === selCatClean || (product.category || '').toLowerCase() === selectedCategory.toLowerCase();
    }

    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden w-full">
      
      {/* Dynamic Navigation Header */}
      <Header onToggleCart={() => setIsCartOpen(true)} />

      {/* Cart Slider Overlay */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* App Main Area */}
      <main className="flex-1">
        {isPaymentPage ? (
          <PaymentStatus type={isPaymentSuccess ? 'sucesso' : isPaymentError ? 'erro' : 'pendente'} />
        ) : currentView === 'home' ? (
          <div>
            {/* Beautiful Promo Banner */}
            <Banner />

            {/* Destaques da Loja Section */}
            <FeaturedProducts />

            {/* Beautiful Catalog Section with Sidebar Categories and Filters */}
            <CatalogSection />
          </div>
        ) : currentView === 'product-detail' ? (
          <ProductDetails />
        ) : (
          <OrdersHistory />
        )}
      </main>

      {/* Beautiful High-End Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Boutigue branding overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold font-sans">
                  A
                </div>
                <span className="font-sans font-extrabold tracking-tight text-white text-base">
                  ATTIRE STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-normal">
                Moda minimalista premium com cortes contemporâneos e tecidos de extrema durabilidade. Projetado no Brasil com carinho.
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700/50">
                  Supabase Active
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700/50">
                  v2026.1
                </span>
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">Nossas Categorias</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-normal">
                <li><button onClick={() => { setSelectedCategory('Camisetas'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Camisetas</button></li>
                <li><button onClick={() => { setSelectedCategory('Blusas'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Blusas</button></li>
                <li><button onClick={() => { setSelectedCategory('Calças'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Calças</button></li>
                <li><button onClick={() => { setSelectedCategory('promocoes'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Promoções</button></li>
              </ul>
            </div>

            {/* Support and Safety info */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">Segurança & Compra</h4>
              <div className="space-y-3.5 text-xs text-slate-400 font-normal">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Checkout Integrado Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <span>Pague via PIX ou Cartão</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  Os dados do seu pedido e endereço de entrega são salvos diretamente em nosso serviço de banco de dados Supabase.
                </div>
              </div>
            </div>

            {/* Contacts details */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">Fale Conosco</h4>
              <div className="space-y-2.5 text-xs text-slate-400 font-normal">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>suporte@attirestudio.com.br</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP</span>
                </div>
              </div>
            </div>

          </div>

          <div className="h-px bg-slate-800 my-8"></div>

          {/* Bottom rights copy */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 ATTIRE Studio Premium Ltda. Todos os direitos reservados.</p>
            <p className="font-mono text-[10px]">Desenvolvido com React, Tailwind & Supabase</p>
          </div>

        </div>
      </footer>

    </div>
  );
}

function FeaturedProducts() {
  const { products, isLoadingProducts } = useStore();
  
  // Filter where destaque = true and ativo = true
  const featured = products.filter(p => p.featured === true && p.active !== false);

  if (isLoadingProducts || featured.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-4 border-b border-rose-100/30">
      <div className="flex items-center gap-2 mb-6 text-left">
        <div className="p-1 px-2.5 bg-rose-50 text-rose-600 rounded-md font-mono text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-rose-500 animate-pulse" />
          Destaques
        </div>
        <h3 className="font-sans font-black text-lg sm:text-xl text-slate-900 tracking-tight">
          Destaques da loja
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
        {featured.map((product) => (
          <div key={`featured-${product.id}`} className="animate-fade-in">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreShell />
    </StoreProvider>
  );
}
