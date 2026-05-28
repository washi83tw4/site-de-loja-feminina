/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Minus, Plus, Trash2, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    handleCheckout, 
    checkoutLoading,
    user,
    signIn
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // Autofill name from Google user profile if registered
  useEffect(() => {
    if (user) {
      setCustomerName(user.displayName || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Validate and run checkout
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Por favor, informe seu nome.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setFormError('Por favor, informe um número de contato válido.');
      return;
    }
    setFormError('');
    await handleCheckout({ customerName, customerPhone, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left" role="dialog" aria-modal="true">
      {/* Background dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Slide-over panel container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition duration-300 ease-in-out">
          
          {/* Header section of cart drawer */}
          <div className="px-5 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-lg text-slate-900">Seu Carrinho</span>
              <span className="bg-rose-50 text-rose-600 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm">O Carrinho está vazio</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Adicione peças da nova coleção clicando em Ver Detalhes.</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
                >
                  Continuar Navegando
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  
                  {/* Item Image */}
                  <div className="w-20 h-24 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0">
                    <img 
                       src={item.product.imageUrl} 
                       alt={item.product.name} 
                       className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details column */}
                  <div className="flex-1 space-y-1.5">
                    <h4 className="font-sans font-bold text-slate-800 text-sm leading-tight line-clamp-1">
                      {item.product.name}
                    </h4>

                    {/* Custom options row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                        Tam: {item.selectedSize}
                      </span>
                      {item.selectedColor && (
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          Cor: {item.selectedColor}
                        </span>
                      )}
                    </div>

                    {/* Price and quantity triggers */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Price tag */}
                      <span className="font-sans font-extrabold text-slate-900 text-sm">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>

                      {/* Mini Selector quantity controller */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Trash action button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition cursor-pointer ml-1"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))
            )}
          </div>

          {/* Form and CTA section */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
              
              {/* Form trigger with billing input */}
              <form onSubmit={onSubmit} className="space-y-3.5">
                <h3 className="font-sans font-bold text-slate-800 text-sm">Dados de Entrega e Contato</h3>
                
                {/* Auth indicator advice */}
                {!user && (
                  <div className="bg-rose-50/50 border border-rose-200/20 rounded-lg p-3 flex gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-rose-950 font-medium leading-relaxed">
                        Faça login com Google para salvar histórico de compras, ou compre como visitante preenchendo abaixo!
                      </p>
                      <button
                        type="button"
                        onClick={signIn}
                        className="text-[11px] font-bold text-rose-600 underline mt-1.5 block cursor-pointer"
                      >
                        Fazer Login com Google
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 transition-colors"
                    />
                  </div>

                  <div>
                     <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      required
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Observações ou Endereço Completo
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Apartamento, Bloco 2. Gostaria de embalagem para presente."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 transition-colors resize-none"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-500 font-semibold">{formError}</p>
                )}

                {/* Subtotal review */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal dos Produtos</span>
                    <span className="font-sans font-extrabold text-slate-900 text-base">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1 text-slate-400">
                    <span>Taxa de Entrega / Frete</span>
                    <span className="font-mono text-green-650 font-bold uppercase">Grátis</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5c] text-white font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 cursor-pointer disabled:bg-slate-400"
                  >
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .018 5.393 0 12.03c0 2.122.554 4.197 1.604 6.013l-1.704 6.22 6.358-1.67a11.804 11.804 0 0 0 5.79 1.517h.005c6.635 0 12.032-5.396 12.035-12.032a11.763 11.763 0 0 0-3.48-8.504Z"/>
                    </svg>
                    {checkoutLoading ? 'Processando...' : 'Finalizar por WhatsApp'}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                    Você será redirecionado para o WhatsApp para confirmar o pagamento direto com nossa equipe.
                  </p>
                </div>

              </form>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
