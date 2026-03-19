"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, Trash2, User, Tag, 
  Plus, Minus, Loader2, CheckCircle, Printer, Search, ArrowLeft, Camera, Percent 
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountValue, setDiscountValue] = useState<string>(''); 
  const [discountType, setDiscountType] = useState<'TK' | 'PERCENT'>('TK');
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // --- 1. SCANNER REDIRECT HANDLER ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skuFromUrl = params.get('sku');
    if (skuFromUrl) {
      const triggerAutoAdd = async () => {
        const { data } = await supabase.from('products').select('*').eq('sku', skuFromUrl).single();
        if (data) {
          addToCartFromSearch(data);
          window.history.replaceState({}, document.title, "/pos");
        }
      };
      triggerAutoAdd();
    }
  }, []);

  // --- 2. SEARCH ENGINE ---
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length > 1) performUniversalSearch();
      else setShowResults(false);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  async function performUniversalSearch() {
    const { data } = await supabase.from('products').select('*')
      .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`).limit(5);
    if (data) { setSearchResults(data); setShowResults(true); }
  }

  const addToCartFromSearch = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, cartId: Date.now(), quantity: 1, customPrice: product.price }];
    });
    setManualTotal(null);
    setSearchQuery(''); 
    setShowResults(false);
  };

  const updateQuantity = (cartId: number, delta: number) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    setManualTotal(null);
  };

  // --- 3. MATH ENGINE ---
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.customPrice) * item.quantity), 0);
  let calculatedDiscount = 0;
  const val = parseFloat(discountValue) || 0;
  if (discountType === 'TK') calculatedDiscount = val;
  else calculatedDiscount = (subtotal * val) / 100;

  const autoTotal = Math.max(0, subtotal - calculatedDiscount);
  const displayTotal = manualTotal !== null ? manualTotal : autoTotal;

  // --- 4. UNIVERSAL PRINTING (Works on iPad/Mobile/PC) ---
  const printReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="font-family: monospace; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">VELKARA.</h2>
            <hr style="border-top: 1px dashed #000;"/>
            <div style="text-align: left; font-size: 12px;">
              <p>Customer: ${customerName || 'Guest'}<br/>Phone: ${customerPhone || 'N/A'}</p>
              <hr style="border-top: 1px dashed #000;"/>
              ${cart.map(i => `<p style="display:flex; justify-content:space-between;"><span>${i.name} x${i.quantity}</span> <span>৳${i.customPrice * i.quantity}</span></p>`).join('')}
              <hr style="border-top: 1px dashed #000;"/>
              <h3 style="display:flex; justify-content:space-between;">TOTAL: <span>৳${displayTotal}</span></h3>
            </div>
            <script>
              window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 500); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

      const { error: saleError } = await supabase.from('sales').insert({
        user_id: user?.id,
        customer_phone: customerPhone || 'Guest',
        total_price: displayTotal,
        discount_applied: calculatedDiscount,
        quantity_sold: totalQty,
        items: cart
      });

      if (saleError) throw saleError;
      for (const item of cart) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity: item.quantity });
      }

      printReceipt();
      setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountValue(''); setManualTotal(null);
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-black text-slate-600 shadow-sm border border-slate-100 hover:text-blue-600 transition-all"><ArrowLeft size={20} /> Dashboard</button>
        <button onClick={() => window.location.href = '/scanner'} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all"><Camera size={20} /> Open Scanner</button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT: CART */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white relative z-50">
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center"><ShoppingCart className="mr-3 text-blue-600"/> Billing Terminal</h2>
            <div className="relative">
              <input className="w-full bg-slate-100 pl-6 pr-5 py-5 rounded-2xl outline-none focus:ring-4 ring-blue-50 font-bold text-lg" placeholder="Search SKU, Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-2xl border border-slate-100 overflow-hidden">
                  {searchResults.map(p => (
                    <div key={p.id} onClick={() => addToCartFromSearch(p)} className="p-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                      <div><p className="font-black">{p.name}</p><p className="text-[10px] text-blue-500 font-bold uppercase">{p.sku}</p></div>
                      <p className="font-black text-blue-600">৳{p.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr><th className="px-8 py-5">Product Info</th><th className="px-8 py-5 text-center">Qty</th><th className="px-8 py-5 text-right">Total</th><th className="px-8 py-5"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <tr key={item.cartId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5"><p className="font-black text-slate-900">{item.name}</p><p className="text-[10px] text-slate-400 font-black uppercase">{item.variant_size} / {item.variant_color}</p></td>
                    <td className="px-8 py-5"><div className="flex items-center justify-center gap-3 bg-slate-100 p-2 rounded-xl"><button onClick={() => updateQuantity(item.cartId, -1)} className="p-1"><Minus size={14}/></button><span className="font-black">{item.quantity}</span><button onClick={() => updateQuantity(item.cartId, 1)} className="p-1"><Plus size={14}/></button></div></td>
                    <td className="px-8 py-5 font-black text-right text-lg">৳{item.customPrice * item.quantity}</td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} className="text-rose-300 hover:text-rose-600"><Trash2 size={20}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: BILLING PANEL */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-white">
            <h2 className="text-xl font-black mb-6 flex items-center"><User className="mr-2 text-blue-600"/> Customer Details</h2>
            <div className="space-y-4">
              <input placeholder="Name" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <input placeholder="Phone" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[45px] shadow-2xl relative overflow-hidden">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Discount</label>
                <div className="flex bg-white/10 p-1 rounded-lg">
                  <button onClick={() => setDiscountType('TK')} className={`px-3 py-1 rounded-md text-[10px] font-black ${discountType === 'TK' ? 'bg-blue-600' : ''}`}>৳</button>
                  <button onClick={() => setDiscountType('PERCENT')} className={`px-3 py-1 rounded-md text-[10px] font-black ${discountType === 'PERCENT' ? 'bg-blue-600' : ''}`}>%</button>
                </div>
              </div>
              <input type="number" placeholder="Value..." className="bg-white/10 w-full p-4 rounded-2xl text-center text-xl font-black text-emerald-400 outline-none" value={discountValue} onChange={(e) => {setDiscountValue(e.target.value); setManualTotal(null);}} />
            </div>
            <div className="text-center pt-6 mb-8">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Grand Total (Editable)</p>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-black mr-2 opacity-30">৳</span>
                <input type="number" className="bg-transparent text-6xl font-black tracking-tighter w-full text-center outline-none" value={manualTotal !== null ? manualTotal : Math.round(displayTotal)} onChange={(e) => setManualTotal(parseFloat(e.target.value))} />
              </div>
            </div>
            <button onClick={handleCompleteSale} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[28px] font-black text-xl flex justify-center items-center shadow-xl active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <><Printer className="mr-2 w-5 h-5"/> PAY & PRINT</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
