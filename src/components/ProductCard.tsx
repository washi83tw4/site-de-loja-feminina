/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductId, setCurrentView } = useStore();

  const handleViewDetails = () => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  // Human-readable category badge
  const getCategoryLabel = (cat: string) => {
    if (!cat) return 'Geral';
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const cleanCat = normalize(cat);
    switch (cleanCat) {
      case 'camisetas': return 'Camisetas';
      case 'blusas': return 'Blusas';
      case 'calcas': return 'Calças';
      case 'shorts': return 'Shorts';
      case 'vestidos': return 'Vestidos';
      case 'casacos': return 'Casacos';
      case 'saias': return 'Saias';
      case 'bolsas': return 'Bolsas';
      case 'acessorios': return 'Acessórios';
      case 'sapatos': return 'Sapatos';
      default: return cat;
    }
  };

  return (
    <div 
      onClick={handleViewDetails}
      className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between hover:border-rose-200 hover:shadow-xl hover:shadow-slate-100/60 duration-300 transition-all active:scale-99 h-full"
    >
      <div>
        {/* Product Image Stage */}
        <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform duration-500 transition group-hover:scale-103"
          />
          
          {/* Subtle overlay helper on hover */}
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <button className="w-full bg-white text-slate-900 py-3 rounded-lg text-sm font-extrabold shadow-lg flex items-center justify-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="w-4 h-4 text-rose-600" />
              Visualizar
            </button>
          </div>

          {/* Featured Ribbon */}
          {product.featured && (
            <span className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded z-10 shadow-sm">
              Mais Vendido
            </span>
          )}

          {/* Promotion Badge */}
          {product.onSale && (
            <span className="absolute top-3 right-3 bg-rose-600 text-white font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded z-10 shadow-sm animate-pulse">
              PROMO
            </span>
          )}
        </div>

        {/* Info detail */}
        <div className="p-4 space-y-2">
          {/* Category label */}
          <span className="block font-mono text-[10px] text-rose-500 font-semibold uppercase tracking-widest leading-none">
            {getCategoryLabel(product.category)}
          </span>

          {/* Product Name */}
          <h3 className="font-sans font-semibold text-slate-800 text-sm sm:text-base group-hover:text-rose-600 transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Size Pills Row */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex gap-1 overflow-x-auto py-0.5 no-scrollbar">
              {product.sizes.map((size) => (
                <span 
                  key={size}
                  className="font-mono text-[9px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing / Footer */}
      <div className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-slate-400">Preço</span>
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            {product.onSale && product.promotionalPrice !== undefined ? (
              <>
                <span className="font-sans font-black text-rose-600 text-base leading-none">
                  R$ {product.promotionalPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="font-sans font-medium text-slate-400 text-xs line-through leading-none">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="font-sans font-extrabold text-slate-950 text-base leading-none">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
        
        <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-colors duration-300">
          <Eye className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
