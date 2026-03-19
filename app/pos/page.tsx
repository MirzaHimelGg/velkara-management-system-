"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, Trash2, User, Plus, Minus, Loader2, Printer, Search, ArrowLeft, Camera 
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

  // --- STOCK GUARD LOGIC ---
  const addToCartFromSearch = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;

      // Check if adding one more exceeds stock
      if (currentQty + 1 > product.stock) {
        alert(`Cannot add more! Only ${product.stock} left in stock.`);
        return prev;
      }

      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId: Date.now(), quantity: 1, customPrice: product.price }];
    });
    setManualTotal(null);
    setSearchQuery(''); 
    setShowResults(false);
  };

  const updateQuantity = (item: any, delta: number) => {
    if (delta > 0 && item.quantity + 1 > item.stock) {
      alert("Insufficient stock!");
      return;
    }
    setCart(prev => prev.map(c => c.cartId === item.cartId ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
    setManualTotal(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.customPrice) * item.quantity), 0);
  let calculatedDiscount = 0;
  const val = parseFloat(discountValue) || 0;
  if (discountType === 'TK') calculatedDiscount = val;
  else calculatedDiscount = (subtotal * val) / 100;

  const autoTotal = Math.max(0, subtotal - calculatedDiscount);
  const displayTotal = manualTotal !== null ? manualTotal : autoTotal;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: saleError } = await supabase.from('sales').insert({
        user_id: user?.id,
        customer_phone: customerPhone || 'Guest',
        total_price: displayTotal, // SYNCED NAME
        discount_applied: calculatedDiscount,
        quantity_sold: cart.reduce((sum, i) => sum + i.quantity, 0),
        items: cart
      });

      if (saleError) throw saleError;
      
      for (const item of cart) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity: item.quantity });
      }

      // Print Logic (Universal)
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`<html><body style="font-family:monospace;padding:20px;"><h2>VELKARA.</h2><hr/><p>Total: ৳${displayTotal}</p><script>window.print();window.close();</script></body></html>`);
      
      setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountValue(''); setManualTotal(null);
      alert("Sale Successful!");
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      {/* (Keep Nav and Search UI as before) */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-black text-slate-600 shadow-sm border border-slate-100 hover:text-blue-600 transition-all"><ArrowLeft size={20} /> Dashboard</button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white relative z-50">
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center"><ShoppingCart className="mr-3 text-blue-600"/> Billing Terminal</h2>
            <div className="relative">
              <input className="w-full bg-slate-100 pl-6 pr-5 py-5 rounded-2xl outline-none font-bold text-lg" placeholder="Search SKU, Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-2xl border border-slate-100 overflow-hidden">
                  {searchResults.map(p => (
                    <div key={p.id} onClick={() => addToCartFromSearch(p)} className="p-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                      <div><p className="font-black">{p.name}</p><p className="text-[10px] text-blue-500 font-bold uppercase">{p.sku} | Stock: {p.stock}</p></div>
                      <p className="font-black text-blue-600">৳{p.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <tr key={item.cartId}>
                    <td className="px-8 py-5"><p className="font-black text-slate-900">{item.name}</p></td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl w-fit">
                        <button onClick={() => updateQuantity(item, -1)}><Minus size={14}/></button>
                        <span className="font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)}><Plus size={14}/></button>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-right">৳{item.customPrice * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* (Keep Checkout Panel UI as before) */}
        <div className="w-full lg:w-[420px] bg-slate-900 text-white p-8 rounded-[45px] shadow-2xl text-center">
            <p className="text-slate-500 font-black text-[10px] uppercase mb-1">Grand Total</p>
            <h2 className="text-6xl font-black mb-10 tracking-tighter">৳{displayTotal}</h2>
            <button onClick={handleCompleteSale} disabled={loading} className="w-full bg-blue-600 py-6 rounded-[28px] font-black text-xl">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "PAY & PRINT"}
            </button>
        </div>
      </div>
    </div>
  );
}
