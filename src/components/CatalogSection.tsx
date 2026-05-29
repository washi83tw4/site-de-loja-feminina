/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Flame, 
  Shirt, 
  Layers, 
  Scissors, 
  Sparkles, 
  Wind, 
  Briefcase, 
  Gem, 
  Footprints, 
  Percent, 
  Tag, 
  Star, 
  Truck, 
  Heart, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Undo2, 
  Loader2, 
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const { 
    products, 
    isLoadingProducts, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery 
  } = useStore();

  // Local state for sidebar filters and view settings
  const [activeFilter, setActiveFilter] = useState<'promocoes' | 'mais_vendidos' | 'novidades' | 'frete_gratis' | 'colecao_autoral' | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevantes' | 'preco_menor' | 'preco_maior' | 'novidades'>('relevantes');
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);

  // Sync category selected outside with internal sidebar active filter
  // If user selects 'promocoes' category, convert it to active filter
  useEffect(() => {
    if (selectedCategory === 'promocoes') {
      setActiveFilter('promocoes');
    }
  }, [selectedCategory]);

  // Sidebar categories and lists based on the image exactly
  const sidebarCategories = [
    { name: 'all', label: 'Tudo', icon: Flame },
    { name: 'Camisetas', label: 'Camisetas', icon: Shirt },
    { name: 'Blusas', label: 'Blusas', icon: Sparkles },
    { name: 'Calças', label: 'Calças', icon: Layers },
    { name: 'Shorts', label: 'Shorts', icon: Scissors },
    { name: 'Vestidos', label: 'Vestidos', icon: Heart },
    { name: 'Casacos', label: 'Casacos', icon: Wind },
    { name: 'Saias', label: 'Saias', icon: Tag },
    { name: 'Bolsas', label: 'Bolsas', icon: Briefcase },
    { name: 'Acessórios', label: 'Acessórios', icon: Gem },
    { name: 'Sapatos', label: 'Sapatos', icon: Footprints },
  ];

  const sidebarFilters = [
    { id: 'promocoes', label: 'Promoções', icon: Percent },
    { id: 'mais_vendidos', label: 'Mais Vendidos', icon: Star },
    { id: 'novidades', label: 'Novidades', icon: Sparkles },
    { id: 'frete_gratis', label: 'Frete Grátis', icon: Truck },
    { id: 'colecao_autoral', label: 'Coleção Autoral', icon: Heart },
  ];

  // Soft Normalizer for flexible comparison of items categories
  const normalize = (str: string) => {
    return (str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // Safe category change handler
  const handleCategoryClick = (catName: string) => {
    if (catName === 'all') {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catName);
    }
    // Clicking a category resets active side filters to keep category focus clean
    setActiveFilter(null);
    setMobileSidebarExpanded(false);
  };

  // Filter click handler (like promo, new, frete gratis)
  const handleFilterClick = (filterId: typeof activeFilter) => {
    setActiveFilter(filterId);
    if (filterId === 'promocoes') {
      setSelectedCategory('promocoes');
    } else {
      setSelectedCategory('all'); // Clear category restrict or keep search broad
    }
    setMobileSidebarExpanded(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setActiveFilter(null);
    setSearchQuery('');
    setSortBy('relevantes');
    setMobileSidebarExpanded(false);
  };

  // Process sorting & filtering
  const processedProducts = useMemo(() => {
    // 1. Base filter
    let items = products.filter(p => p.active !== false);

    // 2. Category match
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'promocoes') {
        items = items.filter(p => p.onSale === true);
      } else {
        const selCatClean = normalize(selectedCategory);
        items = items.filter(p => {
          const prodCatClean = normalize(p.category);
          return prodCatClean === selCatClean || p.category.toLowerCase() === selectedCategory.toLowerCase();
        });
      }
    }

    // 3. Side filters match
    if (activeFilter) {
      if (activeFilter === 'promocoes') {
        items = items.filter(p => p.onSale === true);
      } else if (activeFilter === 'mais_vendidos') {
        items = items.filter(p => p.featured === true);
      } else if (activeFilter === 'novidades') {
        // filter or prioritize newer things (such as the newer ID or first few items)
        items = items.slice().sort((a, b) => b.id.localeCompare(a.id));
      } else if (activeFilter === 'frete_gratis') {
        // items with price > 120 enjoy free shipping
        items = items.filter(p => p.price > 120);
      } else if (activeFilter === 'colecao_autoral') {
        // All objects are autoral signature pieces
        items = items.filter(p => p.id !== '');
      }
    }

    // 4. Search query
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    if (sortBy === 'preco_menor') {
      items.sort((a, b) => {
        const pA = (a.onSale && a.promotionalPrice) ? a.promotionalPrice : a.price;
        const pB = (b.onSale && b.promotionalPrice) ? b.promotionalPrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'preco_maior') {
      items.sort((a, b) => {
        const pA = (a.onSale && a.promotionalPrice) ? a.promotionalPrice : a.price;
        const pB = (b.onSale && b.promotionalPrice) ? b.promotionalPrice : b.price;
        return pB - pA;
      });
    } else if (sortBy === 'novidades') {
      items.sort((a, b) => b.id.localeCompare(a.id));
    }

    return items;
  }, [products, selectedCategory, activeFilter, searchQuery, sortBy]);

  return (
    <div id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      
      {/* Catalog Title Header exactly like the image search box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
            Nossa <span className="text-rose-600 italic font-light font-sans tracking-normal">Coleção Autoral</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Peças exclusivas e selecionadas com acabamento de alfaiataria premium
          </p>
        </div>

        {/* Elegant layout search query bar from image */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no catálogo..."
            className="w-full pl-9 pr-8 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition-all duration-300 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none font-bold text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Toggle Button for Mobile Navigation Filters */}
        <div className="lg:hidden w-full flex items-center justify-between py-2 border-y border-slate-100 mb-2">
          <button
            onClick={() => setMobileSidebarExpanded(!mobileSidebarExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros & Categorias
          </button>
          <div className="text-xs text-slate-500 font-mono">
            {processedProducts.length} itens encontrados
          </div>
        </div>

        {/* 1. Left Sidebar Filter Column */}
        <aside className={`${
          mobileSidebarExpanded ? 'block' : 'hidden lg:block'
        } lg:col-span-3 bg-white border border-slate-150/80 rounded-xl p-5 shadow-xs shrink-0 self-start text-left z-30 transition-all duration-300`}>
          
          {/* Categorias Sidebar Header */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Categorias
            </h3>
            <div className="space-y-1">
              {sidebarCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name && !activeFilter;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={`side-cat-${cat.name}`}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-normal transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-50 text-pink-600 font-black' 
                        : 'text-slate-650 hover:text-pink-600 hover:bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-pink-600' : 'text-slate-400 group-hover:text-pink-650'
                      }`} />
                      <span>{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100 my-4" />

          {/* Filtros Sidebar Section */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Filtros
            </h3>
            <div className="space-y-1">
              {sidebarFilters.map((flt) => {
                const isSelected = activeFilter === flt.id;
                const IconComponent = flt.icon;
                return (
                  <button
                    key={`side-flr-${flt.id}`}
                    onClick={() => handleFilterClick(flt.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-normal transition-all duration-205 cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-50 text-pink-600 font-black' 
                        : 'text-slate-650 hover:text-pink-600 hover:bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-pink-600' : 'text-slate-400'
                      }`} />
                      <span>{flt.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filter Drawer Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 transition duration-150 active:scale-98 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          </div>
        </aside>

        {/* 2. Right Products Grid and Layout Control section */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Sorting / Catalog details toolbar row based on screenshot */}
          <div className="bg-white border border-slate-150/70 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs text-left">
            
            {/* Sorting trigger dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Ordenar por:</span>
              <div className="relative inline-block">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-100/80 border-none rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-pink-200 focus:outline-none cursor-pointer"
                >
                  <option value="relevantes">Mais relevantes</option>
                  <option value="preco_menor">Preço: Menor para Maior</option>
                  <option value="preco_maior">Preço: Maior para Menor</option>
                  <option value="novidades">As mais recentes</option>
                </select>
              </div>
            </div>

            {/* Total count and layout view buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-5">
              <span className="text-slate-500 font-medium">
                <strong className="text-slate-800 font-mono text-sm">{processedProducts.length}</strong> produtos encontrados
              </span>

              {/* Grid vs List layout buttons */}
              <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5 shrink-0">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    layoutMode === 'grid' 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    layoutMode === 'list' 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Loop Grid viewport rendering */}
          {isLoadingProducts ? (
            <div className="h-72 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center space-y-3 shadow-xs">
              <Loader2 className="w-8 h-8 text-rose-650 animate-spin" />
              <p className="text-xs font-bold tracking-widest text-slate-400 font-mono uppercase">
                Atualizando cabideiro...
              </p>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="bg-white border border-slate-150 rounded-xl py-20 px-4 text-center max-w-md mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto border border-slate-100">
                <SlidersHorizontal className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Nenhum produto atende a estes critérios</h3>
                <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">
                  Tente desativar alguns filtros de lateral ou altere o termo de busca na caixa de pesquisa.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition active:scale-95"
              >
                Resetar Filtros
              </button>
            </div>
          ) : (
            <div className={
              layoutMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8" 
                : "space-y-4"
            }>
              {processedProducts.map((product) => (
                <div key={`catalog-p-${product.id}`} className="transition-all duration-300">
                  {layoutMode === 'grid' ? (
                    <ProductCard product={product} />
                  ) : (
                    /* Minimal List View Row item styled premiumly */
                    <div className="bg-white border border-slate-150 hover:border-pink-300/60 p-4 rounded-xl flex gap-5 items-center justify-between text-left group transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-mono text-[9px] uppercase font-semibold text-slate-450">{product.category}</span>
                          <h4 className="font-sans font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">{product.name}</h4>
                          <p className="text-[11px] text-slate-400 max-w-md line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {product.onSale && product.promotionalPrice ? (
                          <>
                            <span className="text-rose-500 font-sans font-black text-sm block">R$ {product.promotionalPrice.toFixed(2).replace('.', ',')}</span>
                            <span className="text-slate-400 font-sans text-[10px] line-through">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          </>
                        ) : (
                          <span className="text-slate-850 font-sans font-black text-sm block">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

    </div>
  );
};
