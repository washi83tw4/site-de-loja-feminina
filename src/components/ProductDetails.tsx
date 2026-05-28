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

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors && product.colors.length > 0 ? product.colors[0] : '');
  const [quantity, setQuantity] = useState<number>(1);
  const [errorText, setErrorText] = useState<string>('');
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorText('Por favor, selecione um tamanho antes de adicionar.');
      return;
    }
    setErrorText('');
    addToCart(product, selectedSize, selectedColor || undefined, quantity);

    // Trigger visual absolute added badge
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
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
        <div className="lg:col-span-7 bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 max-h-[640px] flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover aspect-[4/5] object-center max-h-[640px]"
          />
        </div>

        {/* Right Side: Information Matrix */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          <div>
            <span className="inline-block bg-rose-50 text-rose-600 font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight mt-3">
              {product.name}
            </h1>
            <p className="font-sans font-extrabold text-2xl text-slate-950 mt-2">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
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
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setErrorText('');
                    }}
                    className={`min-w-[48px] h-12 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                      isSizeActive
                        ? 'border-rose-600 bg-rose-600 text-white shadow-sm ring-1 ring-rose-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {size}
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
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Action trigger */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 h-12 bg-rose-600 text-white hover:bg-rose-700 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:bg-green-600 disabled:shadow-none`}
              >
                {isAdded ? (
                  <>✓ Adicionado com Sucesso</>
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
