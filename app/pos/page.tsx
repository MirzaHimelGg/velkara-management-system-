"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, Trash2, User, Tag, 
  Plus, Minus, Loader2, CheckCircle, Printer, Search, X 
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // UNIVERSAL SEARCH STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // 1. UNIVERSAL SEARCH LOGIC (Triggers as you type)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length > 1) {
        performUniversalSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Wait 300ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  async function performUniversalSearch() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
      .limit(5);
    
    if (data) {
      setSearchResults(data);
      setShowResults(true);
    }
  }

  const addToCartFromSearch = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(existing.cartId, 1);
    } else {
      setCart(prev => [...prev, { 
        ...product, 
        cartId: Date.now(), 
        quantity: 1, 
        customPrice: product.price,
        variant_size: product.variant_size || '', 
        variant_color: product.variant_color || '' 
      }]);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const updateQuantity = (cartId: number, delta: number) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const updateItemDetail = (cartId: number, field: string, value: string | number) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.customPrice) * item.quantity), 0);
  const finalTotal = subtotal - globalDiscount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setLoading(true);
    try {
      if (finalTotal >= 5000 && customerPhone) {
        await supabase.from('customers').upsert({ phone: customerPhone, name: customerName, membership_tier: 'Gold' }, { onConflict: 'phone' });
      }
      const { error: saleError } = await supabase.from('sales').insert({
        customer_phone: customerPhone || 'Guest',
        total_amount: finalTotal,
        discount_applied: globalDiscount,
        items: cart
      });
      if (saleError) throw saleError;
      for (const item of cart) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity: item.quantity });
      }
      printReceipt();
      alert(finalTotal >= 5000 ? "Sale Complete! New Member Added." : "Sale Complete!");
      setCart([]); setCustomerName(''); setCustomerPhone(''); setGlobalDiscount(0);
    } catch (err: any) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  const printReceipt = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><body style="font-family:monospace; width:300px; padding:20px;"><center><h2>VELKARA.</h2></center><hr/><p>Customer: ${customerName || 'Guest'}<br/>Phone: ${customerPhone || 'N/A'}</p><hr/>${cart.map(i => `<p>${i.name} x${i.quantity}<br/>${i.variant_size}/${i.variant_color} @ ৳${i.customPrice}</p>`).join('')}<hr/><p>Subtotal: ৳${subtotal}</p><p>Discount: -৳${globalDiscount}</p><h3>TOTAL: ৳${finalTotal}</h3><script>window.print(); window.close();</script></body></html>`);
      win.document.close();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 min-h-screen bg-[#f8fafc]">
      <div className="flex-1 space-y-6">
        {/* UNIVERSAL SEARCH TERMINAL */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-xl border border-white relative z-50">
          <h2 className="text-2xl font-black mb-6 flex items-center text-slate-900"><ShoppingCart className="mr-3 text-blue-600"/> Billing Terminal</h2>
          <div className="relative">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  className="w-full bg-slate-100 pl-14 pr-5 py-5 rounded-2xl outline-none focus:ring-4 ring-blue-50 font-bold text-lg" 
                  placeholder="Search Name, SKU, or Category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* FLOATING SEARCH RESULTS */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchResults.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => addToCartFromSearch(product)}
                    className="p-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-none"
                  >
                    <div>
                      <p className="font-black text-slate-900">{product.name}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{product.sku} | {product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-600">৳{product.price}</p>
                      <p className="text-[10px] font-bold text-slate-400">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CART TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr><th className="px-8 py-5">Product Info</th><th className="px-8 py-5 text-center">Qty</th><th className="px-8 py-5">Price per Unit</th><th className="px-8 py-5 text-right">Total</th><th className="px-8 py-5"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cart.map((item) => (
                <tr key={item.cartId} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900">{item.name}</p>
                    <div className="flex gap-2 mt-2">
                      <input placeholder="Size" value={item.variant_size} onChange={(e) => updateItemDetail(item.cartId, 'variant_size', e.target.value)} className="w-16 text-[10px] font-black bg-slate-100 rounded px-2 py-1 outline-none border-none" />
                      <input placeholder="Color" value={item.variant_color} onChange={(e) => updateItemDetail(item.cartId, 'variant_color', e.target.value)} className="w-20 text-[10px] font-black bg-slate-100 rounded px-2 py-1 outline-none border-none" />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3 bg-slate-100 p-2 rounded-xl">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 hover:text-blue-600"><Minus size={14}/></button>
                      <span className="font-black text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:text-blue-600"><Plus size={14}/></button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <input type="number" value={item.customPrice} onChange={(e) => updateItemDetail(item.cartId, 'customPrice', Number(e.target.value))} className="w-24 bg-blue-50 text-blue-700 font-black p-2 rounded-xl outline-none text-center" />
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 text-lg text-right">৳{item.customPrice * item.quantity}</td>
                  <td className="px-8 py-5 text-right"><button onClick={() => removeItem(item.cartId)} className="text-rose-300 hover:text-rose-600"><Trash2 size={20}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">Cart is empty</div>}
        </div>
      </div>

      {/* RIGHT: CHECKOUT PANEL */}
      <div className="w-full lg:w-[420px] space-y-6">
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white">
          <h2 className="text-xl font-black mb-6 flex items-center"><User className="mr-2 text-blue-600"/> Customer Details</h2>
          <div className="space-y-4">
            <input placeholder="Name" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 font-bold" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input placeholder="Phone (017...)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 font-bold" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            {finalTotal >= 5000 && customerPhone && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center border border-emerald-100"><CheckCircle className="w-3 h-3 mr-2" /> Membership Qualified (৳5000+)</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[45px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Grand Total</p>
            <p className="text-6xl font-black mb-10 tracking-tighter">৳{finalTotal}</p>
            <button onClick={handleCompleteSale} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[28px] font-black text-xl shadow-2xl flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin" /> : <><Printer className="mr-2 w-5 h-5"/> PAY & PRINT</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
