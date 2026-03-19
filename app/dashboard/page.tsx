"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  TrendingUp, AlertTriangle, Plus, Search, LogOut, Loader2 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login'; // Redirect if no one is logged in
    } else {
      setUser(user);
      fetchPrivateData(user.id);
    }
  }

  async function fetchPrivateData(userId: string) {
    // Fetch ONLY products belonging to this user
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fetch ONLY sales belonging to this user
    const { data: salesData } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setProducts(prodData || []);
    setSales(salesData || []);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Calculations
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white p-8 hidden lg:flex flex-col">
        <h1 className="text-2xl font-black tracking-tighter mb-12">VELKARA.</h1>
        <nav className="space-y-6 flex-1">
          <a href="#" className="flex items-center text-blue-400 font-bold"><LayoutDashboard className="mr-3 w-5 h-5"/> Overview</a>
          <a href="/pos" className="flex items-center text-slate-400 hover:text-white transition-colors"><ShoppingBag className="mr-3 w-5 h-5"/> POS Terminal</a>
          <a href="/add-product" className="flex items-center text-slate-400 hover:text-white transition-colors"><Package className="mr-3 w-5 h-5"/> Inventory</a>
        </nav>
        <button onClick={handleLogout} className="flex items-center text-rose-400 font-bold mt-auto hover:text-rose-300">
          <LogOut className="mr-3 w-5 h-5"/> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Store Analytics</h2>
            <p className="text-slate-400 font-medium">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <button 
            onClick={() => window.location.href='/pos'}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-all flex items-center"
          >
            <Plus className="mr-2 w-5 h-5"/> NEW SALE
          </button>
        </header>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 relative overflow-hidden">
            <TrendingUp className="text-emerald-500 mb-4 w-8 h-8" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-4xl font-black text-slate-900">৳{totalRevenue}</h3>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />
          </div>

          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100">
            <Package className="text-blue-500 mb-4 w-8 h-8" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Active Products</p>
            <h3 className="text-4xl font-black text-slate-900">{products.length}</h3>
          </div>

          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100">
            <AlertTriangle className={`${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-300'} mb-4 w-8 h-8`} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Low Stock Items</p>
            <h3 className="text-4xl font-black text-slate-900">{lowStockCount}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT SALES TABLE */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
            <h4 className="text-xl font-black mb-6">Recent Transactions</h4>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900">৳{sale.total_amount}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{sale.customer_phone || 'Guest'}</p>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Success</span>
                </div>
              ))}
              {sales.length === 0 && <p className="text-center text-slate-300 py-10">No sales recorded yet.</p>}
            </div>
          </div>

          {/* INVENTORY QUICK VIEW */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
            <h4 className="text-xl font-black mb-6">Inventory Status</h4>
            <div className="space-y-4">
              {products.slice(0, 5).map((prod) => (
                <div key={prod.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-none">
                  <div>
                    <p className="font-bold text-slate-900">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{prod.variant_size} / {prod.variant_color}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${prod.stock <= 5 ? 'text-rose-500' : 'text-slate-900'}`}>{prod.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
