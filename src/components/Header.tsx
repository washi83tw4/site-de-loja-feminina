/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Search, 
  Shirt, 
  TrendingUp, 
  History,
  Sparkles,
  ShoppingBag as BagIcon 
} from 'lucide-react';

interface HeaderProps {
  onToggleCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleCart }) => {
  const { 
    user, 
    signIn, 
    signOut, 
    cart, 
    searchQuery, 
    setSearchQuery, 
    currentView, 
    setCurrentView,
    setSelectedProductId,
    categories,
    selectedCategory,
    setSelectedCategory
  } = useStore();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleGoHome = () => {
    setSelectedProductId(null);
    setCurrentView('home');
    setSelectedCategory('all');
  };

  const handleGoOrders = () => {
    setCurrentView('orders');
    setShowProfileMenu(false);
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedProductId(null);
    setCurrentView('home');
    setSelectedCategory(catName);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Premium Pink Top Ribbon Bar (Inspired by the reference design) */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white font-semibold text-[9px] xs:text-[10px] sm:text-xs py-2 px-2 sm:px-4 shadow-inner text-center select-none flex items-center justify-center flex-wrap gap-1 md:gap-1.5 leading-relaxed overflow-hidden">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce shrink-0 text-pink-100" />
        <span className="tracking-wide break-words max-w-[90%] sm:max-w-none text-pink-50">
          🌸 EDIÇÃO LIMITADA BARBIE® COLETIVO: GANHE FRETE GRÁTIS + BRINDE EXCLUSIVO EM COMPRAS ACIMA DE R$199! 🌸
        </span>
        <span className="hidden md:inline bg-white/20 px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-widest font-bold ml-2">Promoção</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/50 shadow-sm duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo / Brand configured with elegant Pink styling */}
            <div 
              onClick={handleGoHome}
              className="flex items-center gap-2 cursor-pointer group"
              id="header-branding"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 shadow-md shadow-pink-100">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-serif font-extrabold tracking-tight text-slate-900 text-xl sm:text-2xl block leading-none hover:text-pink-600 transition-colors">
                  Barbie<span className="text-pink-600">Girl</span>
                </span>
                <span className="font-mono text-[9px] text-pink-500 font-extrabold tracking-widest hidden sm:block uppercase mt-0.5">
                  SUA LOJA DE MODA • PREMIUM
                </span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-4">
              
              {/* Shopping Cart Trigger */}
              <button
                onClick={onToggleCart}
                className="relative p-2.5 rounded-full text-slate-700 hover:text-pink-600 hover:bg-rose-50/50 transition-all duration-200 active:scale-95"
                aria-label="Carrinho de compras"
              >
                <ShoppingBag className="w-5.5 h-5.5 text-slate-800 hover:text-pink-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-pink-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User LogIn / Profile Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 p-1 rounded-full border border-rose-100 hover:border-pink-300 hover:bg-rose-50/40 transition-all duration-200 focus:outline-none"
                    >
                      <img
                        src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={user.displayName || 'Usuário'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-pink-100"
                      />
                      <span className="hidden lg:inline text-xs font-bold text-slate-800 pr-1 max-w-[100px] truncate uppercase tracking-tight">
                        {user.displayName?.split(' ')[0]}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-rose-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="px-4 py-3 border-b border-rose-50">
                          <span className="block text-sm font-semibold text-slate-900 truncate">
                            {user.displayName}
                          </span>
                          <span className="block text-xs text-slate-400 truncate mt-0.5">
                            {user.email}
                          </span>
                        </div>
                        
                        <button
                          onClick={handleGoHome}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50/40 transition-colors flex items-center gap-2"
                        >
                          <Shirt className="w-4 h-4 text-pink-500" />
                          Ver Catálogo
                        </button>

                        <button
                          onClick={handleGoOrders}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50/40 transition-colors flex items-center gap-2"
                        >
                          <History className="w-4 h-4 text-pink-500" />
                          Meus Pedidos
                        </button>

                        <div className="border-t border-rose-50 mt-1 my-1"></div>

                        <button
                          onClick={() => {
                            signOut();
                            setShowProfileMenu(false);
                            handleGoHome();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair da Conta
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={signIn}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 text-xs font-bold bg-pink-50 hover:bg-pink-100/80 text-pink-700 rounded-full border border-pink-200 hover:border-pink-300 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer shrink-0"
                  >
                    <User className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="hidden sm:inline">Minha Conta</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Subheader / Submenu Categories bar as shown in reference */}
        <div className="hidden sm:block bg-rose-50/40 border-t border-rose-100/40 py-2.5 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-4 md:gap-6 text-xs font-sans">
            {categories.map((cat) => (
              <button
                key={`header-cat-${cat.id}`}
                onClick={() => handleSelectCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all duration-200 relative cursor-pointer ${
                  selectedCategory === cat.name 
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-100 scale-102' 
                    : 'text-slate-600 hover:text-pink-600 hover:bg-rose-50/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
};
