"use client";
import React from 'react';
import { LayoutDashboard, Package, TrendingUp, AlertTriangle, Plus } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Velkara</h1>
          <p className="text-slate-500 font-medium">Inventory Overview</p>
        </div>
        <button 
          onClick={() => window.location.href = '/add-product'}
          className="bg-slate-900 text-white px-6 py-4 rounded-[22px] font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center"
        >
          <Plus className="mr-2 w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Glass Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Stock', value: '1,240', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Low Stock', value: '4 Items', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Daily Revenue', value: '৳ 14,500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon />
            </div>
            <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Inventory Glass Table */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center">
            <LayoutDashboard className="mr-3 text-blue-600" /> Recent Inventory
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm uppercase tracking-widest">
              <th className="px-8 py-6 font-bold">Product</th>
              <th className="px-8 py-6 font-bold">Stock</th>
              <th className="px-8 py-6 font-bold">Price</th>
              <th className="px-8 py-6 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="hover:bg-blue-50/30 transition-colors">
              <td className="px-8 py-6">
                <p className="font-bold text-slate-900">Velkara Premium Tee</p>
                <p className="text-xs text-slate-400">L / Midnight Black</p>
              </td>
              <td className="px-8 py-6 font-medium">45 Units</td>
              <td className="px-8 py-6 font-black text-blue-600">৳ 1,200</td>
              <td className="px-8 py-6">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
