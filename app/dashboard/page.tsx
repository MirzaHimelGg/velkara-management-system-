"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  LayoutDashboard, 
  ShoppingCart,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Initialize Supabase Connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Data from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  // 2. Universal Search Logic (Name, Category, Price, or SKU)
  const filteredProducts = products.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchStr) ||
      item.category?.toLowerCase().includes(searchStr) ||
      item.sku?.toLowerCase().includes(searchStr) ||
      item.price?.toString().includes(searchStr)
    );
  });

  // 3. Dynamic Calculations for Stat Cards
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock) <= 5).length;
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.stock) * Number(curr.price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 space-y-8 animate-in fade-in duration-1000">
      
      {/* HEADER & NAVIGATION SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Velkara.</h1>
          <p className="text-slate-500 font-bold mt-2 flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-2 text-blue-600" /> Inventory Management System
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Universal Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search anything..."
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-[22px] shadow-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* POS Navigation Button */}
          <button 
            onClick={() => window.location.href = '/pos'}
            className="bg-blue-600 text-white px-8 py-4 rounded-[22px] font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center"
          >
            <ShoppingCart className="mr-2 w-5 h-5" /> POS
          </button>

          {/* Add Product Button */}
          <button 
            onClick={() => window.location.href = '/add-product'}
            className="bg-slate-900 text-white px-8 py-4 rounded-[22px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center"
          >
            <Plus className="mr-2 w-5 h-5" /> ADD
          </button>
        </div>
      </div>

      {/* STAT CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[35px] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Package /></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Inventory</p>
          <p className="text-4xl font-black mt-1 text-slate-900">{totalStock.toLocaleString()}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[35px] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle /></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Low Stock Items</p>
          <p className="text-4xl font-black mt-1 text-slate-900">{lowStockCount}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[35px] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp /></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Valuation (Est.)</p>
          <p className="text-4xl font-black mt-1 text-slate-900">৳{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* INVENTORY TABLE SECTION */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[45px] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50">
          <h2 className="text-2xl font-black text-slate-900">Live Inventory</h2>
          <button onClick={fetchProducts} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
              <p className="font-bold">Syncing with Velkara Database...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="px-10 py-6 font-black">Product Info</th>
                  <th className="px-10 py-6 font-black">Category</th>
                  <th className="px-10 py-6 font-black text-center">In Stock</th>
                  <th className="px-10 py-6 font-black">Price</th>
                  <th className="px-10 py-6 font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-7">
                      <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-lg">{item.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">SKU: {item.sku}</span>
                        <span className="text-[10px] font-bold text-slate-400">{item.variant_size} | {item.variant_color}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">{item.category || 'General'}</span>
                    </td>
                    <td className="px-10 py-7 font-black text-center text-xl text-slate-700">{item.stock}</td>
                    <td className="px-10 py-7 font-black text-blue-600 text-xl">৳{item.price}</td>
                    <td className="px-10 py-7">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        item.stock > 5 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.stock > 5 ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">
              No products found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
