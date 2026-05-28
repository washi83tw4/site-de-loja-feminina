/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { CategoryList } from './components/CategoryList';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { OrdersHistory } from './components/OrdersHistory';
import { Cart } from './components/Cart';
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

  // Filter products by selected category and active search queries
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
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
        {currentView === 'home' ? (
          <div>
            {/* Beautiful Promo Banner */}
            <Banner />

            {/* Category Navigation */}
            <CategoryList />

            {/* Products catalog listing */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {isLoadingProducts ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                  <p className="text-sm font-semibold tracking-wide text-slate-500 font-mono uppercase">
                    Buscando peças no Supabase...
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-lg py-16 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                    <Eye className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-800">Sem resultados para sua busca</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar a categoria ou o termo digitado na caixa de busca.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  >
                    Resetar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="animate-fade-in">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <li><button onClick={() => { setSelectedCategory('camisetas'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Blusas e Camisetas</button></li>
                <li><button onClick={() => { setSelectedCategory('calcas'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Calças e Shorts</button></li>
                <li><button onClick={() => { setSelectedCategory('casacos'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Vestidos e Casacos</button></li>
                <li><button onClick={() => { setSelectedCategory('acessorios'); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="hover:text-rose-400 transition cursor-pointer">Bolsas e Acessórios</button></li>
              </ul>
            </div>

            {/* Support and Safety info */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">Segurança & Compra</h4>
              <div className="space-y-3.5 text-xs text-slate-400 font-normal">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Checkout Privado WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <span>Pague via PIX ou Cartão</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  Para pagamentos, emitimos links ou chaves seguras homologadas durante nossa conversa no chat do WhatsApp.
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

export default function App() {
  return (
    <StoreProvider>
      <StoreShell />
    </StoreProvider>
  );
}
