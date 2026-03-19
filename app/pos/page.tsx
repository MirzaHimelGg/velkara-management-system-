"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, Trash2, User, Tag, 
  Plus, Minus, Loader2, CheckCircle, Printer, Search, ArrowLeft, Camera 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0); 
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // --- 1. AUTO-ADD FROM SCANNER REDIRECT ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skuFromUrl = params.get('sku');
    if (skuFromUrl) {
      const triggerAutoAdd = async () => {
        const { data } = await supabase.from('products').select('*').eq('sku', skuFromUrl).single();
        if (data) {
          addToCartFromSearch(data);
          // Clean URL to prevent double-add on refresh
          window.history.replaceState({}, document.title, "/pos");
        }
      };
      triggerAutoAdd();
    }
  }, []);

  // --- 2. UNIVERSAL SEARCH (NAME/SKU/CATEGORY) ---
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
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId: Date.now(), quantity: 1, customPrice: product.price }];
    });
    setSearchQuery(''); 
    setShowResults(false);
  };

  const updateQuantity = (cartId: number, delta: number) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  // --- 3. DYNAMIC TOTALS & DISCOUNTS ---
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.customPrice) * item.quantity), 0);
  const totalItemsSold = cart.reduce((sum, item) => sum + item.quantity, 0);
  const finalTotal = subtotal - globalDiscount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // INSERT TRANSACTION (Includes quantity_sold to fix DB error)
      const { error: saleError } = await supabase.from('sales').insert({
        user_id: user?.id,
        customer_phone: customerPhone || 'Guest',
        total_amount: finalTotal,
        discount_applied: globalDiscount,
        quantity_sold: totalItemsSold, // FIXES THE NOT-NULL ERROR
        items: cart
      });

      if (saleError) throw saleError;

      // UPDATE STOCK IN DATABASE
      for (const item of cart) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity: item.quantity });
      }

      printReceipt();
      setCart([]); setCustomerName(''); setCustomerPhone(''); setGlobalDiscount(0);
      alert("Sale Recorded Successfully!");

    } catch (err: any) { 
      alert("Database Error: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const printReceipt = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html><body style="font-family:monospace; width:300px; padding:20px;">
        <center><h2>VELKARA.</h2><p>Dhaka, Bangladesh</p></center>
        <hr/>
        <p>Customer: ${customerName || 'Guest'}<br/>Phone: ${customerPhone || 'N/A'}</p>
        <hr/>
        ${cart.map(i => `<p>${i.name} x${i.quantity}<br/>৳${i.customPrice * i.quantity}</p>`).join('')}
        <hr/>
        <p>Subtotal: ৳${subtotal}</p>
        <p>Discount: -৳${globalDiscount}</p>
        <h3 style="display:flex; justify-content:space-between;">TOTAL: <span>৳${finalTotal}</span></h3>
        <script>window.print(); window.close();</script></body></html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      {/* TOP NAVIGATION */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-black text-slate-600 shadow-sm border border-slate-100 hover:text-blue-600 transition-all">
          <ArrowLeft size={20} /> Dashboard
        </button>
        <button onClick={() => window.location.href = '/scanner'} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
          <Camera size={20} /> Open Scanner
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: SEARCH & CART */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white relative z-50">
            <h2 className="text-2xl font-black mb-6 flex items-center text-slate-900"><ShoppingCart className="mr-3 text-blue-600"/> Billing Terminal</h2>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  className="w-full bg-slate-100 pl-14 pr-5 py-5 rounded-2xl outline-none focus:ring-4 ring-blue-50 font-bold text-lg" 
                  placeholder="Search Name, SKU, or Category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-2xl border border-slate-100 overflow-hidden">
                  {searchResults.map(product => (
                    <div key={product.id} onClick={() => addToCartFromSearch(product)} className="p-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none">
                      <div><p className="font-black">{product.name}</p><p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{product.sku}</p></div>
                      <p className="font-black text-blue-600">৳{product.price}</p>
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
                  <tr key={item.cartId} className="hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">{item.variant_size} / {item.variant_color}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3 bg-slate-100 p-2 rounded-xl">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1"><Minus size={14}/></button>
                        <span className="font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1"><Plus size={14}/></button>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-right text-lg">৳{item.customPrice * item.quantity}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} className="text-rose-300 hover:text-rose-600 transition-colors">
                        <Trash2 size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">Cart is empty</div>}
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER & TOTALS */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-white">
            <h2 className="text-xl font-black mb-6 flex items-center"><User className="mr-2 text-blue-600"/> Customer Details</h2>
            <div className="space-y-4">
              <input placeholder="Name" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <input placeholder="Phone" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[45px] shadow-2xl relative overflow-hidden text-center">
            <div className="mb-6">
              <label className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 block">Apply Discount (৳)</label>
              <input 
                type="number" 
                className="bg-white/10 w-full p-4 rounded-2xl text-center text-xl font-black text-emerald-400 outline-none focus:ring-2 ring-emerald-500" 
                value={globalDiscount} 
                onChange={(e) => setGlobalDiscount(Number(e.target.value))} 
              />
            </div>
            
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">Grand Total</p>
            <p className="text-6xl font-black mb-10 tracking-tighter">৳{finalTotal}</p>
            
            <button 
              onClick={handleCompleteSale} 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[28px] font-black text-xl flex justify-center items-center shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Printer className="mr-2 w-5 h-5"/> PAY & PRINT</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
