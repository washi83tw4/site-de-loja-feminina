/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, Plus, Minus, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { 
    products, 
    selectedProductId, 
    setSelectedProductId, 
    setCurrentView, 
    addToCart 
  } = useStore();

  const product = products.find(p => p.id === selectedProductId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500">Produto não encontrado.</p>
        <button 
          onClick={() => setCurrentView('home')} 
          className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-full text-sm font-semibold"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  // Human-readable category mapper
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

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors && product.colors.length > 0 ? product.colors[0] : '');
  const [quantity, setQuantity] = useState<number>(1);
  const [errorText, setErrorText] = useState<string>('');
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const selectedSizeStock = selectedSize
    ? (product.tamanhos_estoque?.[selectedSize] !== undefined
        ? product.tamanhos_estoque[selectedSize]
        : (product.stock || 0))
    : null;

  const isSelectedSizeOutOfStock = selectedSizeStock !== null && selectedSizeStock <= 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setErrorText('');
    }
  };

  const handleIncrease = () => {
    if (selectedSize) {
      if (quantity >= (selectedSizeStock ?? 999)) {
        setErrorText(`Estoque insuficiente para este tamanho. Disponível: ${selectedSizeStock} unidades.`);
        return;
      }
    }
    setQuantity(quantity + 1);
    setErrorText('');
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorText('Por favor, selecione um tamanho antes de adicionar.');
      return;
    }
    if (isSelectedSizeOutOfStock) {
      setErrorText('Tamanho indisponível sem estoque.');
      return;
    }

    setErrorText('');
    const success = addToCart(product, selectedSize, selectedColor || undefined, quantity);

    if (success !== false) {
      // Trigger visual absolute added badge
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2500);
    }
  };

  const handleBackToHome = () => {
    setSelectedProductId(null);
    setCurrentView('home');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={handleBackToHome}
        className="inline-flex items-center gap-2 group text-sm font-semibold text-slate-600 hover:text-rose-600 transition mb-8 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar para a Coleção
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Magnificent Full Image Card */}
        <div className="lg:col-span-7 bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 max-h-[640px] w-full flex items-center justify-center">
          {product.imageUrl && product.imageUrl.trim() !== '' ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover aspect-[4/5] object-center max-h-[640px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const el = document.getElementById(`detail-placeholder-${product.id}`);
                if (el) el.classList.remove('hidden');
              }}
            />
          ) : null}

          <div 
            id={`detail-placeholder-${product.id}`}
            className={`${product.imageUrl && product.imageUrl.trim() !== '' ? 'hidden w-full h-full' : 'w-full h-full min-h-[460px]'} bg-gradient-to-br from-rose-50/55 via-slate-50 to-pink-50/30 flex flex-col items-center justify-center p-8 text-center select-none aspect-[4/5]`}
          >
            {/* Elegant fashion hanger SVG */}
            <div className="w-16 h-16 rounded-full bg-white border border-rose-100 flex items-center justify-center text-pink-500 shadow-md mb-4">
              <svg className="w-8 h-8 stroke-[1.25] text-pink-550" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2a3 3 0 0 1 3 3v2.17A7 7 0 0 1 21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a7 7 0 0 1 6-6.83V5a3 3 0 0 1 3-3z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="14" r="2" />
              </svg>
            </div>
            <span className="font-mono text-xs font-black tracking-widest text-pink-600 uppercase leading-none">PEÇA ATTIRE PREMIUM</span>
            <span className="text-sm text-slate-400 mt-2 max-w-[70%]">{product.name}</span>
          </div>
        </div>

        {/* Right Side: Information Matrix */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          <div>
            <span className="inline-block bg-rose-50 text-rose-600 font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
              {getCategoryLabel(product.category)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight mt-3">
              {product.name}
            </h1>
            <div>
              {product.onSale && product.promotionalPrice !== undefined ? (
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-sans font-black text-3xl text-rose-600">
                    R$ {product.promotionalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="font-sans font-medium text-slate-400 text-lg line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="bg-rose-50 text-rose-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Oferta
                  </span>
                </div>
              ) : (
                <p className="font-sans font-extrabold text-2xl text-slate-950 mt-2">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Details Overview */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Descrição do Produto</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {product.description}
            </p>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Cor Selecionada: <span className="text-slate-800 font-semibold">{selectedColor}</span></h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isColorActive = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        isColorActive
                          ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Tamanhos Disponíveis</h4>
              <span className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">Guia de Medidas</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const isSizeActive = selectedSize === size;
                const sizeStock = product.tamanhos_estoque?.[size] !== undefined 
                  ? product.tamanhos_estoque[size] 
                  : (product.stock || 0);
                const isOutOfStock = sizeStock <= 0;

                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setErrorText('');
                      // Automatically cap quantity if exceeds new size's stock
                      if (quantity > sizeStock) {
                        setQuantity(Math.max(1, sizeStock));
                      }
                    }}
                    className={`min-w-[70px] h-12 px-2.5 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
                        : isSizeActive
                          ? 'border-rose-600 bg-rose-600 text-white shadow-sm ring-1 ring-rose-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{size}</span>
                    {isOutOfStock ? (
                      <span className="text-[9px] font-sans font-normal text-rose-500">Sem estoque</span>
                    ) : (
                      <span className="text-[9px] font-sans font-normal text-slate-400">Disponível: {sizeStock}</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {errorText && (
              <p className="text-xs text-red-500 font-semibold mt-2">{errorText}</p>
            )}
          </div>

          {/* Quantity selector & Add to Bag */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4 items-center">
              {/* Quantity input badge */}
              <div className="flex items-center border border-slate-200 bg-white rounded-lg h-12 px-1">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={selectedSize !== '' && quantity >= (selectedSizeStock ?? 999)}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Action trigger */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded || isSelectedSizeOutOfStock}
                className={`flex-1 h-12 ${isSelectedSizeOutOfStock ? 'bg-slate-350 hover:bg-slate-350 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 active:scale-98'} text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:bg-slate-400 disabled:shadow-none`}
              >
                {isAdded ? (
                  <>✓ Adicionado com Sucesso</>
                ) : isSelectedSizeOutOfStock ? (
                  <>Sem estoque</>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-4"></div>

          {/* Premium Store benefits badges */}
          <div className="space-y-3.5 pt-2">
            <div className="flex gap-3 items-start text-left">
              <Truck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Frete Expresso Grátis</p>
                <p className="text-xs text-slate-500">Nas compras acima de R$ 250 para todo o Brasil.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start text-left">
              <RefreshCw className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Primeira troca grátis</p>
                <p className="text-xs text-slate-500">Troque em até 7 dias após o recebimento sem custos.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start text-left">
              <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Checkout Seguro e Rápido</p>
                <p className="text-xs text-slate-500">Seu pedido é gravado no sistema instantaneamente com criptografia.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
