/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../context/StoreContext';
import { Shirt, ShoppingBag, Tag, Sparkles, BriefcaseBusiness, Search } from 'lucide-react';

export const CategoryList: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  // Map icon strings to Lucide icon components representing premium fashion
  const renderIcon = (iconName: string) => {
    const className = "w-[13px] h-[13px] sm:w-3.5 sm:h-3.5 group-hover:scale-110 transition-transform duration-200 shrink-0";
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'Shirt':
        return <Shirt className={className} />;
      case 'Tag':
        return <Tag className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'BriefcaseBusiness':
        return <BriefcaseBusiness className={className} />;
      default:
        return <Shirt className={className} />;
    }
  };

  return (
    <div id="catalogo" className="px-4 sm:px-6 lg:px-8 py-4 transition-all max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
            Escolha o seu <span className="text-pink-600 font-light italic">look ideal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Encontre o que há de mais recente em roupas estilosas, confortáveis e autênticas.
          </p>
        </div>

        {/* Elegant Human Search Bar integrated right in the category section */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O que quer vestir hoje? Ex: Vestido..."
            className="w-full pl-9 pr-8 py-2 bg-pink-50/25 hover:bg-pink-50/40 border border-rose-100 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-550 focus:ring-2 focus:ring-pink-300/20 focus:bg-white transition-all duration-200"
          />
          <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-pink-600 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 pb-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`group flex items-center justify-center sm:justify-start gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold sm:font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer flex-1 xs:flex-initial min-w-[110px] xs:min-w-0 border active:scale-[0.98] ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white hover:bg-rose-50/20 text-slate-550 hover:text-slate-800 border-slate-200/70 hover:border-rose-200/40'
              }`}
            >
              <span className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-rose-500 group-hover:text-rose-600'}`}>
                {renderIcon(cat.icon)}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
