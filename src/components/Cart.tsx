/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Copy, 
  Check 
} from 'lucide-react';

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
    signIn,
    products
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [preferenceId, setPreferenceId] = useState('');
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [addressZipcode, setAddressZipcode] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [zipLoading, setZipLoading] = useState(false);

  // Prefill Google authenticated profiles if active
  useEffect(() => {
    if (user) {
      setCustomerName(prev => prev || user.displayName || '');
      setCustomerEmail(prev => prev || user.email || '');
    }
  }, [user]);

  // Handle CEP Zipcode autocompletion hook
  const handleZipcodeChange = async (val: string) => {
    // Keep digits only
    const rawVal = val.replace(/\D/g, '');
    
    // Format zipcode visually as 00000-000 for the input field
    let formatted = rawVal;
    if (rawVal.length > 5) {
      formatted = `${rawVal.slice(0, 5)}-${rawVal.slice(5, 8)}`;
    }
    setAddressZipcode(formatted);

    // If exactly 8 digits are typed, fetch details
    if (rawVal.length === 8) {
      setZipLoading(true);
      setFormError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawVal}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setFormError('CEP não encontrado. Preencha o endereço manualmente.');
        } else {
          setAddressStreet(data.logradouro || '');
          setAddressNeighborhood(data.bairro || '');
          setAddressCity(data.localidade || '');
          setAddressState(data.uf || '');
        }
      } catch (err) {
        console.error('Error fetching CEP:', err);
      } finally {
        setZipLoading(false);
      }
    }
  };

  // Mask CPF input to 000.000.000-00
  const handleCpfChange = (val: string) => {
    const rawVal = val.replace(/\D/g, '');
    let formatted = rawVal;
    if (rawVal.length > 11) return; // limit digits
    
    if (rawVal.length > 9) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6, 9)}-${rawVal.slice(9, 11)}`;
    } else if (rawVal.length > 6) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6)}`;
    } else if (rawVal.length > 3) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3)}`;
    }
    setCustomerCpf(formatted);
  };

  // Mask Phone input to (00) 00000-0000
  const handlePhoneChange = (val: string) => {
    const rawVal = val.replace(/\D/g, '');
    let formatted = rawVal;
    if (rawVal.length > 11) return; // limit digits

    if (rawVal.length > 10) {
      formatted = `(${rawVal.slice(0, 2)}) ${rawVal.slice(2, 7)}-${rawVal.slice(7)}`;
    } else if (rawVal.length > 6) {
      formatted = `(${rawVal.slice(0, 2)}) ${rawVal.slice(2, 6)}-${rawVal.slice(6)}`;
    } else if (rawVal.length > 2) {
      formatted = `(${rawVal.slice(0, 2)}) ${rawVal.slice(2)}`;
    } else if (rawVal.length > 0) {
      formatted = `(${rawVal}`;
    }
    setCustomerPhone(formatted);
  };

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => {
    const price = (item.product.onSale && item.product.promotionalPrice !== undefined) ? item.product.promotionalPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Validate form and submit order
  const onFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate each cart item against up-to-date products list to comply with rule 4
    for (const item of cart) {
      const liveProduct = products.find(p => p.id === item.product.id) || item.product;
      const stockAvailable = liveProduct.tamanhos_estoque?.[item.selectedSize] !== undefined
        ? liveProduct.tamanhos_estoque[item.selectedSize]
        : (liveProduct.stock || 0);

      if (item.quantity > stockAvailable) {
        setFormError(`O produto ${liveProduct.name} tamanho ${item.selectedSize} possui apenas ${stockAvailable} unidades disponíveis.`);
        return;
      }
    }

    if (!customerName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Por favor, insira um endereço de e-mail válido.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, insira um telefone de contato válido com DDD.');
      return;
    }
    if (!addressZipcode.trim() || addressZipcode.replace(/\D/g, '').length !== 8) {
      setFormError('Por favor, preencha um CEP válido de 8 dígitos.');
      return;
    }
    if (!addressStreet.trim()) {
      setFormError('Por favor, insira o nome da rua/av.');
      return;
    }
    if (!addressNumber.trim()) {
      setFormError('Por favor, preencha o número do endereço.');
      return;
    }
    if (!addressNeighborhood.trim()) {
      setFormError('Por favor, informe o bairro.');
      return;
    }
    if (!addressCity.trim()) {
      setFormError('Por favor, preencha a cidade.');
      return;
    }
    if (!addressState.trim() || addressState.trim().length !== 2) {
      setFormError('Por favor, insira o estado com a sigla de 2 letras (Ex: SP).');
      return;
    }

    setFormError('');
    setPaymentUrl('');
    setPreferenceId('');

    try {
      const orderId = await handleCheckout({
        customerName,
        customerEmail,
        customerPhone,
        customerCpf: customerCpf || undefined,
        addressZipcode,
        addressStreet,
        addressNumber,
        addressComplement: addressComplement || undefined,
        addressNeighborhood,
        addressCity,
        addressState,
        notes: notes || undefined
      });

      setCreatedOrderId(orderId);

      // Call backend to create Mercado Pago preference
      setIsCreatingPreference(true);
      try {
        const mpResponse = await fetch('/api/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cart.map(item => {
              const itemPrice = (item.product.onSale && item.product.promotionalPrice !== undefined) ? item.product.promotionalPrice : item.product.price;
              return {
                id: item.product.id,
                name: `${item.product.name} (Tam: ${item.selectedSize}${item.selectedColor ? `, Cor: ${item.selectedColor}` : ''})`,
                price: itemPrice,
                quantity: item.quantity,
                imageUrl: item.product.imageUrl
              };
            }),
            payer: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              cpf: customerCpf
            },
            external_reference: orderId
          })
        });

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          setPaymentUrl(mpData.init_point || '');
          setPreferenceId(mpData.id || '');
        } else {
          console.error('Failed to create Mercado Pago preference:', await mpResponse.text());
        }
      } catch (mpError) {
        console.error('Error generating payment preference:', mpError);
      } finally {
        setIsCreatingPreference(false);
      }

      setStep('success');
    } catch (err: any) {
      setFormError(err.message || 'Ocorreu um erro ao finalizar o seu pedido. Tente novamente.');
    }
  };

  const copyOrderId = () => {
    if (createdOrderId) {
      navigator.clipboard.writeText(createdOrderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCloseAndReset = () => {
    setStep('cart');
    setCreatedOrderId('');
    setFormError('');
    setPaymentUrl('');
    setPreferenceId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left" role="dialog" aria-modal="true" id="cart-root-dialog">
      {/* Background dark backdrop overlay */}
      <div 
        onClick={handleCloseAndReset}
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-300"
        id="cart-overlay-dismiss"
      ></div>

      {/* Slide-over panel container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10" id="cart-sliding-container">
        <div 
          className={`w-screen ${
            step === 'checkout' ? 'max-w-md md:max-w-xl' : 'max-w-md'
          } bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 ease-in-out`}
          id="cart-drawer-panel"
        >
          
          {/* Drawer Line Header */}
          <div className="px-5 py-6 border-b border-slate-100 flex items-center justify-between" id="cart-drawer-header">
            <div className="flex items-center gap-2">
              {step === 'checkout' && (
                <button 
                  onClick={() => setStep('cart')}
                  className="p-1.5 -ml-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition mr-1 cursor-pointer"
                  title="Voltar ao carrinho"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="font-sans font-extrabold text-lg text-slate-900">
                {step === 'cart' && 'Seu Carrinho'}
                {step === 'checkout' && 'Dados para entrega'}
                {step === 'success' && 'Pedido Concluído'}
              </span>
              {step === 'cart' && (
                <span className="bg-rose-50 text-rose-600 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
                </span>
              )}
            </div>
            <button
              onClick={handleCloseAndReset}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
              id="cart-close-trigger"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Cart Stage / Contents */}
          {step === 'cart' && (
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100 flex flex-col" id="cart-items-container">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-12" id="cart-empty-view">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-800 text-sm">O Carrinho está vazio</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                      Adicione itens da nova coleção clicando em Ver Detalhes.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  >
                    Adicionar produtos
                  </button>
                </div>
              ) : (
                <div className="space-y-0 flex-1 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const liveProduct = products.find(p => p.id === item.product.id) || item.product;
                    const itemStock = liveProduct.tamanhos_estoque?.[item.selectedSize] !== undefined
                      ? liveProduct.tamanhos_estoque[item.selectedSize]
                      : (liveProduct.stock || 0);

                    return (
                    <div key={item.id} className="py-4 flex gap-4 items-start" id={`cart-item-${item.id}`}>
                      {/* Item Image */}
                      <div className="w-20 h-24 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product.imageUrl && item.product.imageUrl.trim() !== '' ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const el = document.getElementById(`cart-placeholder-${item.id}`);
                              if (el) el.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        
                        <div 
                          id={`cart-placeholder-${item.id}`}
                          className={`${item.product.imageUrl && item.product.imageUrl.trim() !== '' ? 'hidden' : 'w-full h-full'} bg-gradient-to-br from-rose-50 to-slate-50 flex flex-col items-center justify-center text-center p-1 w-full h-full`}
                        >
                          <span className="font-mono text-[7px] font-black text-rose-500 uppercase tracking-widest leading-none">ATTIRE</span>
                          <span className="text-[7px] text-slate-400 mt-1 uppercase scale-90">ITEM</span>
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="flex-1 space-y-1.5 text-left">
                        <h4 className="font-sans font-bold text-slate-800 text-sm leading-tight line-clamp-1">
                          {item.product.name}
                        </h4>

                        {/* Visual details parameters */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                            Tam: {item.selectedSize}
                          </span>
                          {item.selectedColor && (
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                              Cor: {item.selectedColor}
                            </span>
                          )}
                          <span className="text-[10px] text-rose-550 font-semibold font-mono ml-auto">
                            Máximo disponível: {itemStock}
                          </span>
                        </div>

                        {/* Price & quantities toggles */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col text-left">
                            {item.product.onSale && item.product.promotionalPrice !== undefined ? (
                              <div className="flex flex-col">
                                <span className="font-mono text-[10px] text-slate-400 line-through">
                                  R$ {(item.product.price).toFixed(2).replace('.', ',')}
                                </span>
                                <span className="font-sans font-black text-rose-600 text-sm">
                                  R$ {(item.product.promotionalPrice).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ) : (
                              <span className="font-sans font-extrabold text-slate-950 text-sm">
                                R$ {item.product.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>

                          {/* Mini selector triggers */}
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
                              disabled={item.quantity >= itemStock}
                              className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Trash action button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 transition cursor-pointer"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );})}
                </div>
              )}
            </div>
          )}

          {/* Cart Stage CTAs */}
          {step === 'cart' && cart.length > 0 && (
            <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50" id="cart-recap-recap">
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal dos Produtos</span>
                  <span className="font-sans font-extrabold text-slate-900 text-base">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Frete de Entrega</span>
                  <span className="font-mono text-emerald-600 font-bold uppercase tracking-wider text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">Grátis</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 cursor-pointer"
                  id="checkout-advance-trigger"
                >
                  Continuar para Entrega
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Preencha os dados de endereço na próxima etapa para registrar o pedido no Supabase.
                </p>
              </div>
            </div>
          )}

          {/* Checkout Stage Form */}
          {step === 'checkout' && (
            <form onSubmit={onFinalizeOrder} className="flex-1 flex flex-col overflow-hidden" id="checkout-full-form">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                
                {/* User login guide */}
                {!user && (
                  <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-3 flex gap-2.5 text-left" id="checkout-auth-banner">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11.5px] text-rose-950 font-medium leading-relaxed">
                        Faça login com sua conta Google para rastrear seus pedidos e compras futuras!
                      </p>
                      <button
                        type="button"
                        onClick={signIn}
                        className="text-[11.5px] font-bold text-rose-600 hover:text-rose-700 underline mt-1.5 block cursor-pointer"
                      >
                        Identificar-se com e-mail Google
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtitle grouping */}
                <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1.5">
                  1. Informações de Contato
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Nome Completo *
                    </label>
                    <input
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: João da Silva Santos"
                      className="w-full bg-white border border-slate-20 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      E-mail *
                    </label>
                    <input
                      required
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Telefone / Celular *
                    </label>
                    <input
                      required
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(DD) 99999-9999"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      value={customerCpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>
                </div>

                <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1.5 pt-2">
                  2. Endereço de Entrega
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      CEP *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        value={addressZipcode}
                        onChange={(e) => handleZipcodeChange(e.target.value)}
                        placeholder="00000-000"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                      />
                      {zipLoading && (
                        <div className="absolute right-2 top-2.5">
                          <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      required
                      type="text"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="Nome da sua rua ou avenida"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Número *
                    </label>
                    <input
                      required
                      type="text"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="Ex: 123"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Complemento (Apto, bloco...)
                    </label>
                    <input
                      type="text"
                      value={addressComplement}
                      onChange={(e) => setAddressComplement(e.target.value)}
                      placeholder="Ex: Apto 32 Bloco B"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Bairro *
                    </label>
                    <input
                      required
                      type="text"
                      value={addressNeighborhood}
                      onChange={(e) => setAddressNeighborhood(e.target.value)}
                      placeholder="Bairro de entrega"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Cidade *
                    </label>
                    <input
                      required
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="Sua cidade"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Estado (Sigla) *
                    </label>
                    <input
                      required
                      maxLength={2}
                      type="text"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                      placeholder="Ex: SP"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                    />
                  </div>
                </div>

                <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1.5 pt-2">
                  3. Notas Adicionais
                </h3>

                <div>
                  <label className="block font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Observações do pedido
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instruções adicionais de entrega ou solicitações específicas."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 transition-all resize-none"
                  />
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200/50 rounded-lg p-3 text-red-600 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Checkout Footing Drawer Panel */}
              <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Valor Total da Compra</span>
                  <span className="font-sans font-black text-rose-600 text-xl">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-450 text-white font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 cursor-pointer"
                    id="checkout-finalize-button"
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Gravando pedido...
                      </span>
                    ) : (
                      'Finalizar pedido'
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Ao finalizar, seu pedido será gerado e visualizado com um código identificador único.
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* Success Screen Stage */}
          {step === 'success' && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-6" id="checkout-success-view">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-pulse">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="font-sans font-black text-slate-900 text-xl leading-tight">
                  Pedido realizado com sucesso!
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Agradecemos pela preferência. O seu pedido foi gravado com segurança na nossa base de dados Supabase. Recebemos seus dados de contato e endereço.
                </p>
              </div>

              {/* Order ID display panel */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 max-w-sm mx-auto text-left">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Código do Pedido (Copy ID)
                  </span>
                  <button 
                    onClick={copyOrderId}
                    className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                    type="button"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar Código
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200/60 p-2.5 rounded-lg break-all select-all select-text">
                  {createdOrderId}
                </div>
              </div>

              {/* Mercado Pago Payment panel */}
              {isCreatingPreference ? (
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center space-y-3.5 max-w-sm mx-auto">
                  <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-500 font-medium">Gerando link do Mercado Pago...</span>
                </div>
              ) : paymentUrl ? (
                <div className="w-full bg-sky-50/70 border border-sky-100 rounded-xl p-4 space-y-3 max-w-sm mx-auto text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="font-sans font-extrabold text-slate-800 text-xs">
                      Pague com Mercado Pago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                    Conclua sua compra agora usando <strong>Pix</strong> (liberação instantânea), <strong>Cartão de Crédito</strong> em parcelas ou <strong>Boleto</strong>.
                  </p>
                  <a
                    href={paymentUrl}
                    target="_top"
                    rel="noopener noreferrer"
                    className="w-full h-11 bg-[#009ee3] hover:bg-[#0081ba] text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-98 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                    Pagar via Mercado Pago
                  </a>
                </div>
              ) : null}

              <div className="pt-2 w-full max-w-sm font-sans">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs transition-all duration-200 cursor-pointer shadow-sm active:scale-98"
                  id="checkout-success-home-dismiss"
                >
                  Continuar navegando
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
